# Schema Verification - Table Names and Attributes

This document verifies that all table names and attributes match your ERD schema exactly.

## ✅ Verified Table Names (All UPPERCASE)

### 1. USER Table
**Table Name:** `USER`
- ✅ UserID (Primary Key)
- ✅ UserName
- ✅ FName
- ✅ LName
- ✅ Age
- ✅ Gender
- ✅ Address
- ✅ Password

### 2. COUNTRY Table
**Table Name:** `COUNTRY`
- ✅ CountryID (Primary Key)
- ✅ CountryName

**Used in scraper:** ✅ `supabase.table('COUNTRY')`

### 3. CITY Table
**Table Name:** `CITY`
- ✅ CityID (Primary Key)
- ✅ CountryID (Foreign Key → COUNTRY.CountryID)
- ✅ CityName

**Used in scraper:** ✅ `supabase.table('CITY')`

### 4. HOTEL Table
**Table Name:** `HOTEL`
- ✅ HotelID (Primary Key)
- ✅ HotelName
- ✅ HotelRating
- ✅ CityID (Foreign Key → CITY.CityID)

**Used in scraper:** ✅ `supabase.table('HOTEL')`

### 5. HOTEL_IMAGE Table
**Table Name:** `HOTEL_IMAGE`
- ✅ HotelID (Foreign Key → HOTEL.HotelID)
- ✅ HotelImage

**Used in scraper:** ✅ `supabase.table('HOTEL_IMAGE')`

### 6. ROOM_TYPE Table
**Table Name:** `ROOM_TYPE`
- ✅ RoomTypeID (Primary Key)
- ✅ HotelID (Foreign Key → HOTEL.HotelID)
- ✅ RoomTypeName
- ✅ Price
- ✅ Capacity

**Used in scraper:** ✅ `supabase.table('ROOM_TYPE')`

### 7. AVAILABILITY Table
**Table Name:** `AVAILABILITY`
- ✅ RoomTypeID (Foreign Key → ROOM_TYPE.RoomTypeID)
- ✅ Date
- ✅ NumberOfRooms

**Used in scraper:** ✅ `supabase.table('AVAILABILITY')`

### 8. BOOKING Table
**Table Name:** `BOOKING`
- ✅ BookingID (Primary Key)
- ✅ UserID (Foreign Key → USER.UserID)
- ✅ CheckinDate
- ✅ CheckoutDate
- ✅ NoOfRooms
- ✅ RoomTypeID (Foreign Key → ROOM_TYPE.RoomTypeID)
- ✅ Confirmed

**Note:** Not used in scraper (created by users through app)

### 9. TRANSACTION Table
**Table Name:** `TRANSACTION`
- ✅ TransactionID (Primary Key)
- ✅ BookingID (Foreign Key → BOOKING.BookingID)
- ✅ TotalCost
- ✅ TimeStamp

**Note:** Not used in scraper (created by users through app)

### 10. REVIEW Table
**Table Name:** `REVIEW`
- ✅ ReviewID (Primary Key)
- ✅ Review
- ✅ HotelID (Foreign Key → HOTEL.HotelID)
- ✅ UserID (Foreign Key → USER.UserID)

**Used in scraper:** ✅ `supabase.table('REVIEW')` (function exists but not called in main scraper)

## ✅ All Table Names Verified

All table names are **UPPERCASE** and match your ERD schema exactly:

1. ✅ `USER`
2. ✅ `COUNTRY`
3. ✅ `CITY`
4. ✅ `HOTEL`
5. ✅ `HOTEL_IMAGE`
6. ✅ `ROOM_TYPE`
7. ✅ `AVAILABILITY`
8. ✅ `BOOKING`
9. ✅ `TRANSACTION`
10. ✅ `REVIEW`

## ✅ All Attribute Names Verified

All attribute names match your ERD schema exactly. The scraper uses:
- ✅ Exact same attribute names (case-sensitive)
- ✅ Correct data types
- ✅ Proper foreign key relationships

## Summary

**✅ YES - Everything matches your ERD schema exactly!**

- Table names: All UPPERCASE ✓
- Attribute names: Exact match ✓
- Foreign keys: Correct relationships ✓
- Data types: Appropriate for each field ✓

Your Supabase tables should be created with these exact names and attributes.






