package com.cse.snippetmanager.service;

import com.cse.snippetmanager.dto.SnippetDto;
import com.cse.snippetmanager.model.Snippet;
import com.cse.snippetmanager.model.User;
import com.cse.snippetmanager.repository.SnippetRepository;
import com.cse.snippetmanager.repository.UserRepository;
import com.cse.snippetmanager.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SnippetService {

    @Autowired
    private SnippetRepository snippetRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<SnippetDto> getAllSnippets() {
        User user = getCurrentUser();
        List<Snippet> snippets = snippetRepository.findByUserOrderByCreatedAtDesc(user);
        return snippets.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<SnippetDto> getSnippetById(Long id) {
        User user = getCurrentUser();
        return snippetRepository.findByIdAndUser(id, user)
                .map(this::convertToDto);
    }

    public SnippetDto createSnippet(SnippetDto snippetDto) {
        User user = getCurrentUser();
        Snippet snippet = new Snippet(
                snippetDto.getTitle(),
                snippetDto.getCode(),
                snippetDto.getLanguage(),
                snippetDto.getDescription(),
                snippetDto.getTags(),
                user
        );
        Snippet savedSnippet = snippetRepository.save(snippet);
        return convertToDto(savedSnippet);
    }

    public Optional<SnippetDto> updateSnippet(Long id, SnippetDto snippetDto) {
        User user = getCurrentUser();
        return snippetRepository.findByIdAndUser(id, user)
                .map(snippet -> {
                    snippet.setTitle(snippetDto.getTitle());
                    snippet.setCode(snippetDto.getCode());
                    snippet.setLanguage(snippetDto.getLanguage());
                    snippet.setDescription(snippetDto.getDescription());
                    snippet.setTags(snippetDto.getTags());
                    return convertToDto(snippetRepository.save(snippet));
                });
    }

    public boolean deleteSnippet(Long id) {
        User user = getCurrentUser();
        return snippetRepository.findByIdAndUser(id, user)
                .map(snippet -> {
                    snippetRepository.delete(snippet);
                    return true;
                }).orElse(false);
    }

    public List<SnippetDto> searchSnippets(String query) {
        User user = getCurrentUser();
        List<Snippet> snippets = snippetRepository.searchSnippets(user, query);
        return snippets.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStatistics() {
        User user = getCurrentUser();
        Map<String, Object> stats = new HashMap<>();
        
        long totalSnippets = snippetRepository.countByUser(user);
        List<Object[]> languageStats = snippetRepository.getLanguageStatistics(user);
        
        Map<String, Long> languageCount = new HashMap<>();
        for (Object[] stat : languageStats) {
            languageCount.put((String) stat[0], (Long) stat[1]);
        }
        
        stats.put("totalSnippets", totalSnippets);
        stats.put("languageStatistics", languageCount);
        
        return stats;
    }

    private SnippetDto convertToDto(Snippet snippet) {
        return new SnippetDto(
                snippet.getId(),
                snippet.getTitle(),
                snippet.getCode(),
                snippet.getLanguage(),
                snippet.getDescription(),
                snippet.getTags(),
                snippet.getCreatedAt(),
                snippet.getUpdatedAt(),
                snippet.getUser().getUsername()
        );
    }
}