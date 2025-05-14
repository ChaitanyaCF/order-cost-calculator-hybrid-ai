package com.procost.api.service;

import com.procost.api.dto.JwtResponse;
import com.procost.api.dto.LoginRequest;
import com.procost.api.dto.MessageResponse;
import com.procost.api.dto.RegisterRequest;
import com.procost.api.model.User;
import com.procost.api.repository.UserRepository;
import com.procost.api.security.JwtUtils;
import com.procost.api.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder encoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return new JwtResponse(
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.isAdmin(),
                jwt
        );
    }
    
    public MessageResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }
        
        if (registerRequest.getEmail() != null && !registerRequest.getEmail().isEmpty() && 
                userRepository.existsByEmail(registerRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }
        
        // Create new user's account
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(encoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        
        userRepository.save(user);
        
        return new MessageResponse("User registered successfully!");
    }
}