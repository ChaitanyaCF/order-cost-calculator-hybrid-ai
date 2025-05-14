package com.procost.api.service;

import com.procost.api.dto.InquiryRequest;
import com.procost.api.dto.InquiryResponse;
import com.procost.api.dto.MessageResponse;
import com.procost.api.model.Inquiry;
import com.procost.api.model.User;
import com.procost.api.repository.InquiryRepository;
import com.procost.api.repository.UserRepository;
import com.procost.api.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InquiryService {
    
    @Autowired
    private InquiryRepository inquiryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<InquiryResponse> getUserInquiries() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        List<Inquiry> inquiries = inquiryRepository.findByUserOrderByCreatedAtDesc(user);
        
        return inquiries.stream()
                .map(this::mapToInquiryResponse)
                .collect(Collectors.toList());
    }
    
    public MessageResponse saveInquiry(InquiryRequest inquiryRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        Inquiry inquiry = new Inquiry();
        inquiry.setUser(user);
        inquiry.setProduct(inquiryRequest.getProduct());
        inquiry.setTrimType(inquiryRequest.getTrimType());
        inquiry.setRmSpec(inquiryRequest.getRmSpec());
        inquiry.setYieldValue(inquiryRequest.getYieldValue());
        inquiry.setProductType(inquiryRequest.getProductType());
        inquiry.setPackagingType(inquiryRequest.getPackagingType());
        inquiry.setPackagingSize(inquiryRequest.getPackagingSize());
        inquiry.setTransportMode(inquiryRequest.getTransportMode());
        inquiry.setFilingRate(inquiryRequest.getFilingRate());
        inquiry.setPackagingRate(inquiryRequest.getPackagingRate());
        inquiry.setPalletCharge(inquiryRequest.getPalletCharge());
        inquiry.setTerminalCharge(inquiryRequest.getTerminalCharge());
        inquiry.setOptionalCharges(inquiryRequest.getOptionalCharges());
        inquiry.setTotalCharges(inquiryRequest.getTotalCharges());
        
        inquiryRepository.save(inquiry);
        
        return new MessageResponse("Inquiry saved successfully");
    }
    
    private InquiryResponse mapToInquiryResponse(Inquiry inquiry) {
        return new InquiryResponse(
                inquiry.getId(),
                inquiry.getUser().getId(),
                inquiry.getProduct(),
                inquiry.getTrimType(),
                inquiry.getRmSpec(),
                inquiry.getYieldValue(),
                inquiry.getProductType(),
                inquiry.getPackagingType(),
                inquiry.getPackagingSize(),
                inquiry.getTransportMode(),
                inquiry.getFilingRate(),
                inquiry.getPackagingRate(),
                inquiry.getPalletCharge(),
                inquiry.getTerminalCharge(),
                inquiry.getOptionalCharges(),
                inquiry.getTotalCharges(),
                inquiry.getCreatedAt()
        );
    }
}