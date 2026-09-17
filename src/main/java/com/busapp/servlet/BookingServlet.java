package com.busapp.servlet;

import com.busapp.util.DBConnection;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;

@WebServlet("/api/booking")
public class BookingServlet extends HttpServlet {

    // GET → used by admin to fetch all bookings
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        String action = request.getParameter("action");

        try (Connection conn = DBConnection.getConnection()) {

            if ("allBookings".equals(action)) {
                String sql = "SELECT bk.booking_id, u.name AS passenger_name, u.email, " +
                             "r.source, r.destination, r.departure_time, " +
                             "b.bus_name, b.bus_number, " +
                             "bk.seat_number, bk.total_price, bk.booking_status, bk.booking_date " +
                             "FROM bookings bk " +
                             "JOIN users u  ON bk.user_id  = u.user_id " +
                             "JOIN routes r ON bk.route_id = r.route_id " +
                             "JOIN buses b  ON r.bus_id    = b.bus_id " +
                             "ORDER BY bk.booking_id DESC";
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql);
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("bookingId",     rs.getInt("booking_id"));
                    o.put("passengerName", rs.getString("passenger_name"));
                    o.put("email",         rs.getString("email"));
                    o.put("source",        rs.getString("source"));
                    o.put("destination",   rs.getString("destination"));
                    o.put("departureTime", rs.getString("departure_time"));
                    o.put("busName",       rs.getString("bus_name"));
                    o.put("busNumber",     rs.getString("bus_number"));
                    o.put("seat",          rs.getInt("seat_number"));
                    o.put("price",         rs.getDouble("total_price"));
                    o.put("status",        rs.getString("booking_status"));
                    o.put("bookingDate",   rs.getString("booking_date"));
                    arr.put(o);
                }
                out.print(arr.toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print("[]");
        } finally {
            out.flush();
        }
    }

    // POST → book, myBookings, cancel
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        String action = request.getParameter("action");

        try (Connection conn = DBConnection.getConnection()) {

            if ("book".equals(action)) {
                int routeId    = Integer.parseInt(request.getParameter("routeId"));
                int userId     = Integer.parseInt(request.getParameter("userId"));
                int seatNumber = Integer.parseInt(request.getParameter("seatNumber"));

                // Check seat availability
                PreparedStatement chk = conn.prepareStatement(
                    "SELECT * FROM bookings WHERE route_id=? AND seat_number=?");
                chk.setInt(1, routeId);
                chk.setInt(2, seatNumber);
                if (chk.executeQuery().next()) {
                    out.print("{\"status\":\"error\",\"message\":\"Seat already booked!\"}");
                    return;
                }

                // Get fare
                PreparedStatement fareStmt = conn.prepareStatement("SELECT fare FROM routes WHERE route_id=?");
                fareStmt.setInt(1, routeId);
                ResultSet fareRs = fareStmt.executeQuery();
                double fare = fareRs.next() ? fareRs.getDouble("fare") : 0;

                // Insert booking
                PreparedStatement book = conn.prepareStatement(
                    "INSERT INTO bookings (route_id, user_id, seat_number, total_price, booking_status) VALUES (?,?,?,?,'CONFIRMED')");
                book.setInt(1, routeId);
                book.setInt(2, userId);
                book.setInt(3, seatNumber);
                book.setDouble(4, fare);
                book.executeUpdate();

                // Reduce available seats
                PreparedStatement upd = conn.prepareStatement(
                    "UPDATE buses SET available_seats = available_seats - 1 WHERE bus_id = (SELECT bus_id FROM routes WHERE route_id=?)");
                upd.setInt(1, routeId);
                upd.executeUpdate();

                out.print("{\"status\":\"success\",\"message\":\"Ticket booked successfully!\"}");

            } else if ("myBookings".equals(action)) {
                int userId = Integer.parseInt(request.getParameter("userId"));
                String sql = "SELECT bk.booking_id, r.source, r.destination, r.departure_time, r.arrival_time, " +
                             "bk.seat_number, bk.total_price, bk.booking_status " +
                             "FROM bookings bk JOIN routes r ON bk.route_id = r.route_id WHERE bk.user_id=?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, userId);
                ResultSet rs = stmt.executeQuery();
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("bookingId",     rs.getInt("booking_id"));
                    o.put("source",        rs.getString("source"));
                    o.put("destination",   rs.getString("destination"));
                    o.put("departureTime", rs.getString("departure_time"));
                    o.put("arrivalTime",   rs.getString("arrival_time"));
                    o.put("seat",          rs.getInt("seat_number"));
                    o.put("price",         rs.getDouble("total_price"));
                    o.put("status",        rs.getString("booking_status"));
                    arr.put(o);
                }
                JSONObject result = new JSONObject();
                result.put("bookings", arr);
                out.print(result.toString());

            } else if ("cancel".equals(action)) {
                int bookingId = Integer.parseInt(request.getParameter("bookingId"));

                // Get route_id from booking before cancelling
                PreparedStatement getRoute = conn.prepareStatement(
                    "SELECT route_id FROM bookings WHERE booking_id=? AND booking_status != 'CANCELLED'");
                getRoute.setInt(1, bookingId);
                ResultSet routeRs = getRoute.executeQuery();

                if (!routeRs.next()) {
                    out.print("{\"status\":\"error\",\"message\":\"Booking not found or already cancelled!\"}");
                    return;
                }
                int routeId = routeRs.getInt("route_id");

                // Update status
                PreparedStatement upd = conn.prepareStatement(
                    "UPDATE bookings SET booking_status='CANCELLED' WHERE booking_id=?");
                upd.setInt(1, bookingId);
                upd.executeUpdate();

                // Restore available seat
                PreparedStatement restore = conn.prepareStatement(
                    "UPDATE buses SET available_seats = available_seats + 1 WHERE bus_id = (SELECT bus_id FROM routes WHERE route_id=?)");
                restore.setInt(1, routeId);
                restore.executeUpdate();

                out.print("{\"status\":\"success\",\"message\":\"Booking cancelled successfully!\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}");
        } finally {
            out.flush();
        }
    }
}
