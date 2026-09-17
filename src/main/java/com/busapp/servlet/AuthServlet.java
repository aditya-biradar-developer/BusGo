package com.busapp.servlet;

import com.busapp.model.User;
import com.busapp.util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@WebServlet("/api/auth")
public class AuthServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        String action = request.getParameter("action");

        try (Connection conn = DBConnection.getConnection()) {

            if ("signup".equals(action)) {
                String name     = request.getParameter("name");
                String email    = request.getParameter("email");
                String password = request.getParameter("password");
                String role     = request.getParameter("role");

                PreparedStatement chk = conn.prepareStatement("SELECT email FROM users WHERE email=?");
                chk.setString(1, email);
                if (chk.executeQuery().next()) {
                    out.print("{\"status\":\"error\",\"message\":\"Email already exists!\"}");
                } else {
                    PreparedStatement ins = conn.prepareStatement(
                        "INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)");
                    ins.setString(1, name);
                    ins.setString(2, email);
                    ins.setString(3, password);
                    ins.setString(4, role);
                    ins.executeUpdate();
                    out.print("{\"status\":\"success\",\"message\":\"Signup successful!\"}");
                }

            } else if ("login".equals(action)) {
                String email    = request.getParameter("email");
                String password = request.getParameter("password");

                PreparedStatement stmt = conn.prepareStatement(
                    "SELECT * FROM users WHERE email=? AND password=?");
                stmt.setString(1, email);
                stmt.setString(2, password);
                ResultSet rs = stmt.executeQuery();

                if (rs.next()) {
                    User user = new User();
                    user.setName(rs.getString("name"));
                    user.setEmail(rs.getString("email"));
                    user.setRole(rs.getString("role"));

                    HttpSession session = request.getSession();
                    session.setAttribute("currentUser", user);

                    int userId = rs.getInt("user_id");
                    out.print("{\"status\":\"success\",\"role\":\"" + user.getRole() +
                              "\",\"name\":\"" + user.getName() +
                              "\",\"userId\":" + userId + "}");
                } else {
                    out.print("{\"status\":\"error\",\"message\":\"Invalid email or password!\"}");
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\",\"message\":\"Server error!\"}");
        } finally {
            out.flush();
        }
    }
}