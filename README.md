# BusGo

BusGo is a bus booking web application built using Java Servlets, MySQL, HTML, CSS, and JavaScript.

The application allows passengers to search for buses, check available seats, make bookings, and manage their bookings. It also has an admin section for managing buses, routes, users, and bookings.

## Features

### Passenger

- Register and login
- Search buses by source and destination
- View bus details, schedule, fare, and available seats
- Select and book an available seat
- View personal bookings
- Cancel bookings

### Admin

- View dashboard statistics
- Add, update, and delete buses
- Add, update, and delete routes
- View registered users
- View all bookings

## Technologies Used

- Java 8
- JDBC
- Java Servlets
- Apache Maven
- Apache Tomcat
- MySQL 8+
- HTML
- CSS
- JavaScript


## Project Structure

```text
BusGo/
├── pom.xml
├── .gitignore
├── README.md
└── src/
    └── main/
        ├── java/
        │   └── com/busapp/
        │       ├── model/
        │       ├── servlet/
        │       └── util/
        └── webapp/
            ├── css/
            ├── js/
            ├── pages/
            └── WEB-INF/
```

## Database

BusGo uses MySQL to store application data such as users, buses, routes, and bookings.

Create the database using:

```sql
CREATE DATABASE bus_booking_db;
```

The application uses the following environment variables for database configuration:

| Variable | Description |
|---|---|
| `BUS_DB_URL` | MySQL database URL |
| `BUS_DB_USER` | MySQL username |
| `BUS_DB_PASSWORD` | MySQL password |

For example:

```text
BUS_DB_URL=jdbc:mysql://localhost:3306/bus_booking_db
BUS_DB_USER=root
BUS_DB_PASSWORD=your_password
```

Make sure the MySQL server is running before starting the application.

## Running the Project

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

### 2. Open the project

```bash
cd BusGo
```

### 3. Build the project

Run:

```bash
mvn clean package
```

Maven will download the required dependencies and build the project.

The generated WAR file will be available inside the `target` directory.

### 4. Run the application

If Tomcat is configured through Maven, run:

```bash
mvn tomcat7:run
```

Then open the application in your browser:

```text
http://localhost:8080/BusBookingSystem/
```

You can also deploy the generated WAR file to a compatible Apache Tomcat server.

## API Endpoints

The frontend communicates with the backend through Java Servlet endpoints.

| Endpoint | Purpose |
|---|---|
| `/api/auth` | User registration and login |
| `/api/bus` | Bus search and bus management |
| `/api/route` | Route listing and management |
| `/api/booking` | Booking, cancellation, and booking management |
| `/api/user` | User listing and admin dashboard data |

Most operations use an `action` request parameter to determine the required operation.

## Configuration

Database credentials should be provided through environment variables instead of being stored directly in the source code.

For example, in PowerShell:

```powershell
$env:BUS_DB_URL = "jdbc:mysql://localhost:3306/bus_booking_db"
$env:BUS_DB_USER = "root"
$env:BUS_DB_PASSWORD = "your_password"
```

Do not commit real passwords, API keys, or other sensitive information to GitHub.

## Requirements

Before running the project, make sure you have:

- JDK 8 or later
- Apache Maven 3.6+
- MySQL 8+
- Apache Tomcat

You can check your Java and Maven installations using:

```bash
java -version
mvn -version
```

## Notes

This project was developed as a Java web application for learning and practicing Java Servlets, database connectivity, backend development, and frontend integration.

It is intended for learning and demonstration purposes rather than production use.
