package com.busapp.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static final String URL = getSetting("BUS_DB_URL", "jdbc:mysql://localhost:3306/bus_booking_db");
    private static final String USER = getSetting("BUS_DB_USER", "root");
    private static final String PASS = getSetting("BUS_DB_PASSWORD", "");

    private static String getSetting(String name, String defaultValue) {
        String value = System.getenv(name);
        return value == null || value.trim().isEmpty() ? defaultValue : value;
    }

    public static Connection getConnection() throws SQLException, ClassNotFoundException {
        Class.forName("com.mysql.cj.jdbc.Driver");
        return DriverManager.getConnection(URL, USER, PASS);
    }
}