package com.bicap.core.dto;

import java.util.List;

public class PagedResponse<T> {
    private List<T> items;
    private int page;
    private int size;
    private long totalItems;
    private int totalPages;
    private String sort;

    public static <T> PagedResponse<T> of(List<T> items, int page, int size, long totalItems, int totalPages, String sort) {
        PagedResponse<T> response = new PagedResponse<>();
        response.setItems(items);
        response.setPage(page);
        response.setSize(size);
        response.setTotalItems(totalItems);
        response.setTotalPages(totalPages);
        response.setSort(sort);
        return response;
    }

    public List<T> getItems() { return items; }
    public void setItems(List<T> items) { this.items = items; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public long getTotalItems() { return totalItems; }
    public void setTotalItems(long totalItems) { this.totalItems = totalItems; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
    public String getSort() { return sort; }
    public void setSort(String sort) { this.sort = sort; }
}
