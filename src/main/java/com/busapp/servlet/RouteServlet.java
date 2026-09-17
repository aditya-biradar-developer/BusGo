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

@WebServlet("/api/route")
public class RouteServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        PrintWriter out = response.getWriter();
        String action = request.getParameter("action");

        try (Connection conn = DBConnection.getConnection()) {

            if ("cities".equals(action)) {
                String sql = "SELECT DISTINCT source AS city FROM routes " +
                             "UNION SELECT DISTINCT destination FROM routes ORDER BY city";
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql);
                JSONArray arr = new JSONArray();
                while (rs.next()) arr.put(rs.getString("city"));
                out.print(arr.toString());

            } else if ("all".equals(action)) {
                String sql = "SELECT r.*, b.bus_name, b.bus_number FROM routes r " +
                             "JOIN buses b ON r.bus_id = b.bus_id ORDER BY r.route_id DESC";
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql);
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("routeId",       rs.getInt("route_id"));
                    o.put("busId",         rs.getInt("bus_id"));
                    o.put("busName",       rs.getString("bus_name"));
                    o.put("busNumber",     rs.getString("bus_number"));
                    o.put("source",        rs.getString("source"));
                    o.put("destination",   rs.getString("destination"));
                    o.put("departureTime", rs.getString("departure_time"));
                    o.put("arrivalTime",   rs.getString("arrival_time"));
                    o.put("fare",          rs.getDouble("fare"));
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
                int    busId         = Integer.parseInt(request.getParameter("busId"));
                String source        = request.getParameter("source");
                String destination   = request.getParameter("destination");
                String departureTime = request.getParameter("departureTime");
                String arrivalTime   = request.getParameter("arrivalTime");
                double fare          = Double.parseDouble(request.getParameter("fare"));

                String sql = "INSERT INTO routes (bus_id, source, destination, departure_time, arrival_time, fare) VALUES (?,?,?,?,?,?)";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, busId);
                stmt.setString(2, source);
                stmt.setString(3, destination);
                stmt.setString(4, departureTime);
                stmt.setString(5, arrivalTime);
                stmt.setDouble(6, fare);
                stmt.executeUpdate();
                out.print("{\"status\":\"success\",\"message\":\"Route added successfully!\"}");

            } else if ("edit".equals(action)) {
                int    routeId       = Integer.parseInt(request.getParameter("routeId"));
                int    busId         = Integer.parseInt(request.getParameter("busId"));
                String source        = request.getParameter("source");
                String destination   = request.getParameter("destination");
                String departureTime = request.getParameter("departureTime");
                String arrivalTime   = request.getParameter("arrivalTime");
                double fare          = Double.parseDouble(request.getParameter("fare"));

                String sql = "UPDATE routes SET bus_id=?, source=?, destination=?, departure_time=?, arrival_time=?, fare=? WHERE route_id=?";
                PreparedStatement stmt = conn.prepareStatement(sql);
                stmt.setInt(1, busId);
                stmt.setString(2, source);
                stmt.setString(3, destination);
                stmt.setString(4, departureTime);
                stmt.setString(5, arrivalTime);
                stmt.setDouble(6, fare);
                stmt.setInt(7, routeId);
                stmt.executeUpdate();
                out.print("{\"status\":\"success\",\"message\":\"Route updated successfully!\"}");

            } else if ("delete".equals(action)) {
                int routeId = Integer.parseInt(request.getParameter("routeId"));

                PreparedStatement d1 = conn.prepareStatement("DELETE FROM bookings WHERE route_id=?");
                d1.setInt(1, routeId);
                d1.executeUpdate();

                PreparedStatement d2 = conn.prepareStatement("DELETE FROM routes WHERE route_id=?");
                d2.setInt(1, routeId);
                d2.executeUpdate();

                out.print("{\"status\":\"success\",\"message\":\"Route deleted successfully!\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}");
        } finally {
            out.flush();
        }
    }
}
