package com.busapp.servlet;

import com.busapp.util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/api/bus")
public class BusServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        String action = request.getParameter("action");

        try (Connection conn = DBConnection.getConnection()) {

            if ("search".equals(action)) {
                String source      = request.getParameter("source");
                String destination = request.getParameter("destination");
                String sql = "SELECT r.route_id, b.bus_id, b.bus_name, b.bus_number, b.total_seats, " +
                             "b.available_seats, b.bus_type, r.source, r.destination, " +
                             "r.departure_time, r.arrival_time, r.fare " +
                             "FROM routes r JOIN buses b ON r.bus_id = b.bus_id " +
                             "WHERE r.source LIKE ? AND r.destination LIKE ?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, "%" + source + "%");
                stmt.setString(2, "%" + destination + "%");
                ResultSet rs = stmt.executeQuery();
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("routeId",       rs.getInt("route_id"));
                    o.put("busId",         rs.getInt("bus_id"));
                    o.put("busName",       rs.getString("bus_name"));
                    o.put("busNumber",     rs.getString("bus_number"));
                    o.put("totalSeats",    rs.getInt("total_seats"));
                    o.put("availableSeats",rs.getInt("available_seats"));
                    o.put("busType",       rs.getString("bus_type"));
                    o.put("source",        rs.getString("source"));
                    o.put("destination",   rs.getString("destination"));
                    o.put("departureTime", rs.getString("departure_time"));
                    o.put("arrivalTime",   rs.getString("arrival_time"));
                    o.put("fare",          rs.getDouble("fare"));
                    arr.put(o);
                }
                out.print(arr.toString());

            } else if ("all".equals(action)) {
                String sql = "SELECT b.*, u.name AS operator_name FROM buses b " +
                             "LEFT JOIN users u ON b.operator_id = u.user_id ORDER BY b.bus_id DESC";
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql);
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("busId",         rs.getInt("bus_id"));
                    o.put("busName",       rs.getString("bus_name"));
                    o.put("busNumber",     rs.getString("bus_number"));
                    o.put("totalSeats",    rs.getInt("total_seats"));
                    o.put("availableSeats",rs.getInt("available_seats"));
                    o.put("busType",       rs.getString("bus_type"));
                    o.put("operatorId",    rs.getInt("operator_id"));
                    String opName = rs.getString("operator_name");
                    o.put("operatorName",  opName != null ? opName : "");
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

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        String action = request.getParameter("action");

        try (Connection conn = DBConnection.getConnection()) {

            if ("add".equals(action)) {
                String busName   = request.getParameter("busName");
                String busNumber = request.getParameter("busNumber");
                int    totalSeats = Integer.parseInt(request.getParameter("totalSeats"));
                String busType   = request.getParameter("busType");
                int    operatorId = Integer.parseInt(request.getParameter("operatorId"));

                String sql = "INSERT INTO buses (bus_name, bus_number, total_seats, available_seats, bus_type, operator_id) VALUES (?,?,?,?,?,?)";
                PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                stmt.setString(1, busName);
                stmt.setString(2, busNumber);
                stmt.setInt(3, totalSeats);
                stmt.setInt(4, totalSeats);
                stmt.setString(5, busType);
                stmt.setInt(6, operatorId);
                stmt.executeUpdate();
                ResultSet keys = stmt.getGeneratedKeys();
                int newId = keys.next() ? keys.getInt(1) : 0;
                out.print("{\"status\":\"success\",\"message\":\"Bus added successfully!\",\"busId\":" + newId + "}");

            } else if ("edit".equals(action)) {
                int    busId     = Integer.parseInt(request.getParameter("busId"));
                String busName   = request.getParameter("busName");
                String busNumber = request.getParameter("busNumber");
                int    totalSeats = Integer.parseInt(request.getParameter("totalSeats"));
                String busType   = request.getParameter("busType");

                String sql = "UPDATE buses SET bus_name=?, bus_number=?, total_seats=?, bus_type=? WHERE bus_id=?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setString(1, busName);
                stmt.setString(2, busNumber);
                stmt.setInt(3, totalSeats);
                stmt.setString(4, busType);
                stmt.setInt(5, busId);
                stmt.executeUpdate();
                out.print("{\"status\":\"success\",\"message\":\"Bus updated successfully!\"}");

            } else if ("delete".equals(action)) {
                int busId = Integer.parseInt(request.getParameter("busId"));

                // Delete bookings linked to this bus's routes first
                PreparedStatement d1 = conn.prepareStatement(
                    "DELETE FROM bookings WHERE route_id IN (SELECT route_id FROM routes WHERE bus_id=?)");
                d1.setInt(1, busId);
                d1.executeUpdate();

                PreparedStatement d2 = conn.prepareStatement("DELETE FROM routes WHERE bus_id=?");
                d2.setInt(1, busId);
                d2.executeUpdate();

                PreparedStatement d3 = conn.prepareStatement("DELETE FROM buses WHERE bus_id=?");
                d3.setInt(1, busId);
                d3.executeUpdate();

                out.print("{\"status\":\"success\",\"message\":\"Bus deleted successfully!\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}");
        } finally {
            out.flush();
        }
    }
}
