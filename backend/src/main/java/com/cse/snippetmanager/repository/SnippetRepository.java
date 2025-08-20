package com.cse.snippetmanager.repository;

import com.cse.snippetmanager.model.Snippet;
import com.cse.snippetmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SnippetRepository extends JpaRepository<Snippet, Long> {
    List<Snippet> findByUserOrderByCreatedAtDesc(User user);
    
    Optional<Snippet> findByIdAndUser(Long id, User user);
    
    @Query("SELECT s FROM Snippet s WHERE s.user = :user AND " +
           "(LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.language) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Snippet> searchSnippets(@Param("user") User user, @Param("query") String query);
    
    @Query("SELECT s.language, COUNT(s) FROM Snippet s WHERE s.user = :user GROUP BY s.language")
    List<Object[]> getLanguageStatistics(@Param("user") User user);
    
    long countByUser(User user);
}