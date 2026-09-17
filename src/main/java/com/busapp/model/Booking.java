package com.busapp.model;

import java.time.LocalDateTime;

public class Booking {
    private int bookingId;
    private int routeId;
    private int userId;
    private int seatNumber;
    private double totalPrice;
    private String bookingStatus; // CONFIRMED, CANCELLED, PENDING
    private LocalDateTime bookingDate;

    public Booking() {}

    public Booking(int bookingId, int routeId, int userId, int seatNumber, double totalPrice, String bookingStatus, LocalDateTime bookingDate) {
        this.bookingId = bookingId;
        this.routeId = routeId;
        this.userId = userId;
        this.seatNumber = seatNumber;
        this.totalPrice = totalPrice;
        this.bookingStatus = bookingStatus;
        this.bookingDate = bookingDate;
    }

    // Getters and Setters
    public int getBookingId() { return bookingId; }
    public void setBookingId(int bookingId) { this.bookingId = bookingId; }

    public int getRouteId() { return routeId; }
    public void setRouteId(int routeId) { this.routeId = routeId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getSeatNumber() { return seatNumber; }
    public void setSeatNumber(int seatNumber) { this.seatNumber = seatNumber; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
}
