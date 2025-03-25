package com.stombie.uploader_v4.repository;

import com.stombie.uploader_v4.entity.Video;
import com.stombie.uploader_v4.model.VideoStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface VideoRepository extends JpaRepository<Video, UUID> {
    List<Video> findByCreatedAtLessThanEqualAndStatusIn(Instant date, List<VideoStatus> statuses);
}
