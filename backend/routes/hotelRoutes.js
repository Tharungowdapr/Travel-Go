const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

/**
 * GET /api/hotels
 * Get all hotels with optional city filter
 */
router.get('/', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    const { cityId } = req.query;

    let query = supabase
      .from('HOTEL')
      .select(`
        HotelID,
        HotelName,
        HotelRating,
        CityID,
        CITY (
          CityID,
          CityName,
          CountryID,
          COUNTRY (
            CountryID,
            CountryName
          )
        )
      `);

    if (cityId) {
      query = query.eq('CityID', cityId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotels',
      message: error.message
    });
  }
});

/**
 * GET /api/hotels/:hotelId
 * Get a specific hotel by ID with full details
 */
router.get('/:hotelId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    const { hotelId } = req.params;

    const { data, error } = await supabase
      .from('HOTEL')
      .select(`
        HotelID,
        HotelName,
        HotelRating,
        CityID,
        CITY (
          CityID,
          CityName,
          CountryID,
          COUNTRY (
            CountryID,
            CountryName
          )
        )
      `)
      .eq('HotelID', hotelId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Hotel not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel',
      message: error.message
    });
  }
});

/**
 * GET /api/hotels/:hotelId/images
 * Get images for a specific hotel
 */
router.get('/:hotelId/images', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    const { hotelId } = req.params;

    const { data, error } = await supabase
      .from('HOTEL_IMAGE')
      .select('*')
      .eq('HotelID', hotelId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching hotel images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch hotel images',
      message: error.message
    });
  }
});

/**
 * GET /api/hotels/:hotelId/rooms
 * Get room types for a specific hotel
 */
router.get('/:hotelId/rooms', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    const { hotelId } = req.params;

    const { data, error } = await supabase
      .from('ROOM_TYPE')
      .select(`
        RoomTypeID,
        HotelID,
        RoomTypeName,
        Price,
        Capacity
      `)
      .eq('HotelID', hotelId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room types',
      message: error.message
    });
  }
});

/**
 * GET /api/cities
 * Get all cities with their countries
 */
router.get('/cities/all', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    const { data, error } = await supabase
      .from('CITY')
      .select(`
        CityID,
        CityName,
        CountryID,
        COUNTRY (
          CountryID,
          CountryName
        )
      `);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities',
      message: error.message
    });
  }
});

module.exports = router;
