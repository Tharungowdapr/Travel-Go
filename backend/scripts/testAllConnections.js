#!/usr/bin/env node
/**
 * Comprehensive Database Connection Test Script
 * Tests all database connections used in TravelGo application
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { MongoClient } = require('mongodb');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
};

let testResults = {
    supabase: { success: false, message: '' },
    mongodb: { success: false, message: '' },
    postgres: { success: false, message: '' },
    gemini: { success: false, message: '' },
};

/**
 * Test Supabase Connection
 */
async function testSupabase() {
    log.section('Testing Supabase Connection');

    try {
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
        }

        log.info(`Connecting to: ${process.env.SUPABASE_URL}`);

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Test connection by querying USER table
        const { data, error, count } = await supabase
            .from('USER')
            .select('*', { count: 'exact', head: true });

        if (error) {
            throw error;
        }

        log.success('Supabase connection successful');
        log.info(`Found USER table (${count !== null ? count + ' records' : 'count unavailable'})`);

        // Try to list other tables
        const { data: countries } = await supabase
            .from('COUNTRY')
            .select('CountryID, CountryName')
            .limit(3);

        if (countries && countries.length > 0) {
            log.info(`Sample countries: ${countries.map(c => c.CountryName).join(', ')}`);
        }

        testResults.supabase = {
            success: true,
            message: 'Connected successfully, tables accessible'
        };

    } catch (error) {
        log.error(`Supabase connection failed: ${error.message}`);
        testResults.supabase = {
            success: false,
            message: error.message
        };
    }
}

/**
 * Test MongoDB Connection
 */
async function testMongoDB() {
    log.section('Testing MongoDB Connection');

    let client = null;

    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error('Missing MONGODB_URI in .env');
        }

        log.info(`Connecting to MongoDB Atlas...`);
        log.info(`Database: ${process.env.MONGODB_DB_NAME || 'travelgo'}`);

        client = new MongoClient(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        await client.connect();
        log.success('MongoDB connection successful');

        const dbName = process.env.MONGODB_DB_NAME || 'travelgo';
        const db = client.db(dbName);

        // List collections
        const collections = await db.listCollections().toArray();
        log.info(`Collections found: ${collections.length}`);

        if (collections.length > 0) {
            log.info(`Collection names: ${collections.map(c => c.name).join(', ')}`);
        }

        // Test write operation
        const testCollection = db.collection('connection_test');
        const testDoc = {
            test: true,
            timestamp: new Date(),
            message: 'Connection test successful'
        };

        const insertResult = await testCollection.insertOne(testDoc);
        log.success(`Test document inserted with ID: ${insertResult.insertedId}`);

        // Test read operation
        const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
        if (foundDoc) {
            log.success('Test document retrieved successfully');
        }

        // Clean up test document
        await testCollection.deleteOne({ _id: insertResult.insertedId });
        log.info('Test document cleaned up');

        testResults.mongodb = {
            success: true,
            message: `Connected to ${dbName}, ${collections.length} collections found`
        };

    } catch (error) {
        log.error(`MongoDB connection failed: ${error.message}`);
        testResults.mongodb = {
            success: false,
            message: error.message
        };
    } finally {
        if (client) {
            await client.close();
            log.info('MongoDB connection closed');
        }
    }
}

/**
 * Test Local PostgreSQL Connection
 */
async function testLocalPostgreSQL() {
    log.section('Testing Local PostgreSQL Connection');

    let pool = null;

    try {
        const pgConfig = {
            user: process.env.LOCAL_PG_USER || 'tharungowdapr',
            host: process.env.LOCAL_PG_HOST || 'localhost',
            database: process.env.LOCAL_PG_DB || 'travelgo',
            password: process.env.LOCAL_PG_PASSWORD || '',
            port: process.env.LOCAL_PG_PORT || 5432,
        };

        log.info(`Connecting to: ${pgConfig.user}@${pgConfig.host}:${pgConfig.port}/${pgConfig.database}`);

        pool = new Pool(pgConfig);

        // Test connection
        const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');

        log.success('Local PostgreSQL connection successful');
        log.info(`PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
        log.info(`Server time: ${result.rows[0].current_time}`);

        // List tables
        const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

        if (tablesResult.rows.length > 0) {
            log.info(`Tables found: ${tablesResult.rows.length}`);
            log.info(`Table names: ${tablesResult.rows.map(r => r.table_name).join(', ')}`);
        } else {
            log.warning('No tables found in public schema');
        }

        testResults.postgres = {
            success: true,
            message: `Connected successfully, ${tablesResult.rows.length} tables found`
        };

    } catch (error) {
        log.warning(`Local PostgreSQL connection failed: ${error.message}`);
        log.info('This is optional - application can work without local PostgreSQL');
        testResults.postgres = {
            success: false,
            message: `${error.message} (optional)`
        };
    } finally {
        if (pool) {
            await pool.end();
            log.info('PostgreSQL connection closed');
        }
    }
}

/**
 * Test Gemini API Connection
 */
async function testGeminiAPI() {
    log.section('Testing Gemini API Connection');

    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('Missing GEMINI_API_KEY in .env');
        }

        log.info('Initializing Gemini AI...');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        log.info('Sending test prompt...');

        const result = await model.generateContent('Say "Hello from TravelGo!" in exactly those words.');
        const response = result.response.text();

        log.success('Gemini API connection successful');
        log.info(`Response: ${response.substring(0, 100)}${response.length > 100 ? '...' : ''}`);

        testResults.gemini = {
            success: true,
            message: 'API key valid, model responding'
        };

    } catch (error) {
        log.error(`Gemini API connection failed: ${error.message}`);
        testResults.gemini = {
            success: false,
            message: error.message
        };
    }
}

/**
 * Print Summary Report
 */
function printSummary() {
    log.section('Connection Test Summary');

    console.log('\n');
    console.log('Service              Status      Details');
    console.log('─'.repeat(80));

    Object.entries(testResults).forEach(([service, result]) => {
        const statusIcon = result.success ? '✅' : '❌';
        const statusColor = result.success ? colors.green : colors.red;
        const serviceName = service.charAt(0).toUpperCase() + service.slice(1);

        console.log(
            `${serviceName.padEnd(20)} ${statusColor}${statusIcon}${colors.reset}          ${result.message}`
        );
    });

    console.log('─'.repeat(80));

    const criticalServices = ['supabase', 'mongodb', 'gemini'];
    const criticalPassed = criticalServices.every(s => testResults[s].success);

    console.log('\n');
    if (criticalPassed) {
        log.success('All critical services are operational! 🎉');
        console.log('\n');
        return 0;
    } else {
        log.error('Some critical services failed. Please check configuration.');
        console.log('\n');
        return 1;
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('\n');
    log.info('TravelGo Database Connection Test');
    log.info('Testing all database connections...');

    await testSupabase();
    await testMongoDB();
    await testLocalPostgreSQL();
    await testGeminiAPI();

    const exitCode = printSummary();
    process.exit(exitCode);
}

// Run tests
main().catch(error => {
    log.error(`Unexpected error: ${error.message}`);
    console.error(error);
    process.exit(1);
});
