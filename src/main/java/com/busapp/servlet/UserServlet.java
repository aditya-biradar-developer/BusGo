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

@WebServlet("/api/user")
public class UserServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        String action = request.getParameter("action");

        try (Connection conn = DBConnection.getConnection()) {

            if ("all".equals(action)) {
                String sql = "SELECT user_id, name, email, role, created_at FROM users ORDER BY user_id DESC";
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql);
                JSONArray arr = new JSONArray();
                while (rs.next()) {
                    JSONObject o = new JSONObject();
                    o.put("userId",    rs.getInt("user_id"));
                    o.put("name",      rs.getString("name"));
                    o.put("email",     rs.getString("email"));
                    o.put("role",      rs.getString("role"));
                    o.put("createdAt", rs.getString("created_at"));
                    arr.put(o);
                }
                out.print(arr.toString());

            } else if ("stats".equals(action)) {
                JSONObject stats = new JSONObject();
                ResultSet r1 = conn.createStatement().executeQuery("SELECT COUNT(*) AS c FROM buses");
                stats.put("totalBuses",    r1.next() ? r1.getInt("c") : 0);
                ResultSet r2 = conn.createStatement().executeQuery("SELECT COUNT(*) AS c FROM routes");
                stats.put("totalRoutes",   r2.next() ? r2.getInt("c") : 0);
                ResultSet r3 = conn.createStatement().executeQuery("SELECT COUNT(*) AS c FROM bookings WHERE booking_status!='CANCELLED'");
                stats.put("totalBookings", r3.next() ? r3.getInt("c") : 0);
                ResultSet r4 = conn.createStatement().executeQuery("SELECT COUNT(*) AS c FROM users");
                stats.put("totalUsers",    r4.next() ? r4.getInt("c") : 0);
                ResultSet r5 = conn.createStatement().executeQuery("SELECT IFNULL(SUM(total_price),0) AS rev FROM bookings WHERE booking_status='CONFIRMED'");
                stats.put("totalRevenue",  r5.next() ? r5.getDouble("rev") : 0);
                out.print(stats.toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{}");
        } finally {
            out.flush();
        }
    }
}
