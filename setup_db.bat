@echo off
REM MySQL Setup Script for Bus Booking System
REM This script will create tables and insert sample data

echo Running database setup...
cd C:\Users\birad\Downloads\IntenshipProject\BusBookingSystem

REM Run the SQL setup file
mysql -u root -p < setup_tables.sql

echo Database setup completed!
pause
