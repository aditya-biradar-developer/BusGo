# PowerShell Script to Setup Bus Booking Database
# Run this script in PowerShell

$sqlFile = "C:\Users\birad\Downloads\IntenshipProject\BusBookingSystem\setup_tables.sql"
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# Check if MySQL exists
if (Test-Path $mysqlPath) {
    Write-Host "Setting up Bus Booking Database..." -ForegroundColor Green
    
    # Read SQL file and pipe to MySQL
    Get-Content $sqlFile | & $mysqlPath -u root -p bus_booking_db
    
    Write-Host "Database setup completed!" -ForegroundColor Green
} else {
    Write-Host "MySQL not found at: $mysqlPath" -ForegroundColor Red
    Write-Host "Please update the path in this script."
}
