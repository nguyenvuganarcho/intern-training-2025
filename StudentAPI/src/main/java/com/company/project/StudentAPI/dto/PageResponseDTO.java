package com.company.project.StudentAPI.dto;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResponseDTO<T> {
    private boolean success;
    private PageData<T> data;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PageData<T> {
        private List<T> items;
        private int page;
        private int size;
        private Long totalItems;
        private int totalPages;
    }

    public PageResponseDTO(boolean success, List<T> items, int page, int size, long totalItems, int totalPages) {
        this.success = success;
        this.data = new PageData<>(items, page, size, totalItems, totalPages);
    }
}
