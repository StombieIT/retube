package com.stombie.uploader_v4.model.api;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FFlowFinishParams {
    /**
     * Путь, по которому будет сохранено итоговые манифесты и чанки видео на статике холдера
     */
    private String savingPath;

    // Билдер делаю для удобства и с заделом на будущее
    public static class Builder {
        private final FFlowFinishParams params;

        public Builder() {
            params = new FFlowFinishParams();
        }

        public Builder setSavingPath(String savingPath) {
            params.savingPath = savingPath;
            return this;
        }

        public FFlowFinishParams build() {
            return params;
        }
    }
}
