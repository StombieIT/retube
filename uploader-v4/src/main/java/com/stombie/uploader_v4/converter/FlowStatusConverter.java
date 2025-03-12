package com.stombie.uploader_v4.converter;

import com.stombie.uploader_v4.model.FlowStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;

import java.sql.SQLException;

@Converter(autoApply = true)
public class FlowStatusConverter implements AttributeConverter<FlowStatus, PGobject> {

    @Override
    public PGobject convertToDatabaseColumn(FlowStatus attribute) {
        if (attribute == null) {
            return null;
        }
        PGobject pgObject = new PGobject();
        pgObject.setType("flows_status_enum"); // имя вашего enum-типа в БД
        try {
            pgObject.setValue(attribute.name());
        } catch (SQLException e) {
            throw new RuntimeException("Ошибка конвертации enum в PGobject", e);
        }
        return pgObject;
    }

    @Override
    public FlowStatus convertToEntityAttribute(PGobject dbData) {
        if (dbData == null) {
            return null;
        }
        return FlowStatus.valueOf(dbData.getValue());
    }
}
