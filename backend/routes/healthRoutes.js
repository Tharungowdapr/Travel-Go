const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { getMongoDB } = require('../config/database');
const { Pool } = require('pg');

/**
 * GET /api/health/all
 * Check all database connections
 */
router.get('/all', async (req, res) => {
    const results = {
        timestamp: new Date().toISOString(),
        services: {
            supabase: { status: 'unknown', message: '' },
            mongodb: { status: 'unknown', message: '' },
            postgres: { status: 'unknown', message: '' },
        },
        overall: 'unknown'
    };

    // Test Supabase
    try {
        const { error } = await supabase
            .from('USER')
            .select('count', { count: 'exact', head: true });

        if (error) throw error;

        results.services.supabase = {
            status: 'healthy',
            message: 'Connected successfully'
        };
    } catch (error) {
        results.services.supabase = {
            status: 'unhealthy',
            message: error.message
        };
    }

    // Test MongoDB
    try {
        const db = getMongoDB();
        await db.admin().ping();

        results.services.mongodb = {
            status: 'healthy',
            message: 'Connected successfully'
        };
    } catch (error) {
        results.services.mongodb = {
            status: 'unhealthy',
            message: error.message
        };
    }

    // Test Local PostgreSQL
    try {
        const pool = new Pool({
            user: process.env.LOCAL_PG_USER || 'tharungowdapr',
            host: process.env.LOCAL_PG_HOST || 'localhost',
            database: process.env.LOCAL_PG_DB || 'travelgo',
            password: process.env.LOCAL_PG_PASSWORD || '',
            port: process.env.LOCAL_PG_PORT || 5432,
        });

        await pool.query('SELECT 1');
        await pool.end();

        results.services.postgres = {
            status: 'healthy',
            message: 'Connected successfully'
        };
    } catch (error) {
        results.services.postgres = {
            status: 'unhealthy',
            message: `${error.message} (optional)`
        };
    }

    // Determine overall health
    const criticalServices = ['supabase', 'mongodb'];
    const allCriticalHealthy = criticalServices.every(
        service => results.services[service].status === 'healthy'
    );

    results.overall = allCriticalHealthy ? 'healthy' : 'degraded';

    const statusCode = allCriticalHealthy ? 200 : 503;
    res.status(statusCode).json({
        success: allCriticalHealthy,
        ...results
    });
});

/**
 * GET /api/health/supabase
 * Check Supabase connection
 */
router.get('/supabase', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(503).json({
                success: false,
                status: 'unhealthy',
                error: 'Supabase not configured'
            });
        }

        const { data, error } = await supabase
            .from('USER')
            .select('count', { count: 'exact', head: true });

        if (error) throw error;

        res.json({
            success: true,
            status: 'healthy',
            message: 'Supabase connection successful',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            error: 'Supabase connection failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/health/mongodb
 * Check MongoDB connection
 */
router.get('/mongodb', async (req, res) => {
    try {
        const db = getMongoDB();

        // Ping the database
        await db.admin().ping();

        // Get database stats
        const stats = await db.stats();

        res.json({
            success: true,
            status: 'healthy',
            message: 'MongoDB connection successful',
            database: db.databaseName,
            collections: stats.collections,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            error: 'MongoDB connection failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/health/postgres
 * Check local PostgreSQL connection
 */
router.get('/postgres', async (req, res) => {
    let pool = null;

    try {
        pool = new Pool({
            user: process.env.LOCAL_PG_USER || 'tharungowdapr',
            host: process.env.LOCAL_PG_HOST || 'localhost',
            database: process.env.LOCAL_PG_DB || 'travelgo',
            password: process.env.LOCAL_PG_PASSWORD || '',
            port: process.env.LOCAL_PG_PORT || 5432,
        });

        const result = await pool.query('SELECT NOW() as current_time, version() as version');

        res.json({
            success: true,
            status: 'healthy',
            message: 'PostgreSQL connection successful',
            serverTime: result.rows[0].current_time,
            version: result.rows[0].version.split(' ')[1],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            error: 'PostgreSQL connection failed',
            message: error.message,
            note: 'Local PostgreSQL is optional',
            timestamp: new Date().toISOString()
        });
    } finally {
        if (pool) {
            await pool.end();
        }
    }
});

module.exports = router;
