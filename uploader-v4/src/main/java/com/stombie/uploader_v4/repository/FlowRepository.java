package com.stombie.uploader_v4.repository;

import com.stombie.uploader_v4.entity.Flow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlowRepository extends JpaRepository<Flow, UUID> {
    List<Flow> findByVideo_Id(UUID videoId);
}
