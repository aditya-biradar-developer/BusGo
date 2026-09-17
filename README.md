# BusGo

BusGo is a bus booking web application built with Java Servlets, MySQL, HTML, CSS, and JavaScript. Passengers can search routes, choose seats, make bookings, and manage their bookings. Administrators can manage buses, routes, users, and bookings from the admin dashboard.

## Features

### Passenger

- Create an account and sign in
- Search buses by source and destination
- View bus type, seat availability, schedule, and fare
- Book an available seat
- View personal bookings
- Cancel bookings

### Administrator

- View dashboard statistics
- Add, edit, and delete buses
- Add, edit, and delete routes
- View registered users
- View all bookings

## Technology Stack

- Java 8
- Java Servlets 4.0.1
- Apache Maven
- Apache Tomcat
- MySQL 8+
- HTML, CSS, and vanilla JavaScript
- MySQL Connector/J 8.0.33
- org.json

## Project Structure

```text
BusBookingSystem/
├── pom.xml
└── src/
    └── main/
        ├── java/com/busapp/
        │   ├── model/
        │   ├── servlet/
        │   └── util/
        └── webapp/
            ├── css/
            ├── js/
            ├── pages/
            └── WEB-INF/
```

## Requirements

Install the following software before running the project:

- JDK 8 or a compatible newer JDK
- Apache Maven 3.6+
- MySQL Server 8+
- Apache Tomcat, if deploying the generated WAR manually

Verify Java and Maven:

```bash
java -version
mvn -version
```

## Database Setup

1. Start the MySQL server.
2. Create the database:

```sql
CREATE DATABASE bus_booking_db;
```

3. Select the database:

```sql
USE bus_booking_db;
```

4. Run the table and sample-data script from the project root:

```bash
mysql -u root -p bus_booking_db < setup_tables.sql
```

The script creates the `users`, `buses`, `routes`, and `bookings` tables and inserts sample records.

The repository also includes `setup_db.bat` and `setup_db.ps1` for Windows users. These scripts assume that the MySQL command-line client is available and may require path changes for your local installation.

## Database Configuration

The application reads database settings from environment variables:

| Variable | Default value |
| --- | --- |
| `BUS_DB_URL` | `jdbc:mysql://localhost:3306/bus_booking_db` |
| `BUS_DB_USER` | `root` |
| `BUS_DB_PASSWORD` | empty |

PowerShell example:

```powershell
$env:BUS_DB_URL = "jdbc:mysql://localhost:3306/bus_booking_db"
$env:BUS_DB_USER = "root"
$env:BUS_DB_PASSWORD = "your-mysql-password"
```

Set these variables in the same terminal session used to start the application. Do not commit passwords or other secrets to the repository.

## Build and Run

Build the WAR file:

```bash
mvn clean package
```

Run with the configured Tomcat Maven plugin:

```bash
mvn tomcat7:run
```

Open the application at:

```text
http://localhost:8080/BusBookingSystem/
```

The generated WAR file is created at `target/BusBookingSystem-1.0.war`.

To deploy manually, copy the WAR file to the `webapps` directory of a compatible Tomcat server and start Tomcat.

## API Endpoints

The frontend communicates with these servlet endpoints:

- `/api/auth` - signup and login
- `/api/bus` - bus search and bus administration
- `/api/route` - route listing and route administration
- `/api/booking` - booking, cancellation, passenger bookings, and admin booking listing
- `/api/user` - user listing and admin dashboard statistics

Most operations use an `action` request parameter to select the operation.

## Sample Accounts

The database seed script inserts these demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@busapp.com` | `admin123` |
| Passenger | `john@busapp.com` | `pass123` |

Change or remove these sample credentials before using the application outside a local development environment.

## Security Notes

This project is intended for learning and demonstration purposes. Before production use, add password hashing, server-side authorization checks for admin endpoints, input validation, CSRF protection, secure session settings, transaction handling for booking operations, and HTTPS. Never store real credentials in source code or seed files.

## License

No license has been specified for this repository yet.
