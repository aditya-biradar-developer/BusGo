package com.busapp.model;

public class Bus {
    private int busId;
    private String busName;
    private String busNumber;
    private int totalSeats;
    private int availableSeats;
    private String busType; // AC, Non-AC, etc.
    private int operatorId;

    public Bus() {}

    public Bus(int busId, String busName, String busNumber, int totalSeats, int availableSeats, String busType, int operatorId) {
        this.busId = busId;
        this.busName = busName;
        this.busNumber = busNumber;
        this.totalSeats = totalSeats;
        this.availableSeats = availableSeats;
        this.busType = busType;
        this.operatorId = operatorId;
    }

    // Getters and Setters
    public int getBusId() { return busId; }
    public void setBusId(int busId) { this.busId = busId; }

    public String getBusName() { return busName; }
    public void setBusName(String busName) { this.busName = busName; }

    public String getBusNumber() { return busNumber; }
    public void setBusNumber(String busNumber) { this.busNumber = busNumber; }

    public int getTotalSeats() { return totalSeats; }
    public void setTotalSeats(int totalSeats) { this.totalSeats = totalSeats; }

    public int getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(int availableSeats) { this.availableSeats = availableSeats; }

    public String getBusType() { return busType; }
    public void setBusType(String busType) { this.busType = busType; }

    public int getOperatorId() { return operatorId; }
    public void setOperatorId(int operatorId) { this.operatorId = operatorId; }
}
