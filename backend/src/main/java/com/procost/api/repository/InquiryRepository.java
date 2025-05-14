package com.procost.api.repository;

import com.procost.api.model.Inquiry;
import com.procost.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByUserOrderByCreatedAtDesc(User user);
}