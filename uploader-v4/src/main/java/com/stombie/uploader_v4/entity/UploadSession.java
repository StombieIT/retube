package com.stombie.uploader_v4.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "upload_sessions")
public class UploadSession {

    @Id
    @GeneratedValue(generator = "UUID")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "total_bytes", nullable = false)
    private Integer totalBytes;

    @Column(name = "uploaded_bytes", nullable = false)
    private Integer uploadedBytes = 0;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "flow_id", referencedColumnName = "id")
    private Flow flow;
}
