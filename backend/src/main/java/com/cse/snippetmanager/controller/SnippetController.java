package com.cse.snippetmanager.controller;

import com.cse.snippetmanager.dto.SnippetDto;
import com.cse.snippetmanager.service.SnippetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/snippets")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class SnippetController {

    @Autowired
    private SnippetService snippetService;

    @GetMapping
    public ResponseEntity<List<SnippetDto>> getAllSnippets() {
        List<SnippetDto> snippets = snippetService.getAllSnippets();
        return ResponseEntity.ok(snippets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SnippetDto> getSnippetById(@PathVariable Long id) {
        return snippetService.getSnippetById(id)
                .map(snippet -> ResponseEntity.ok().body(snippet))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SnippetDto> createSnippet(@Valid @RequestBody SnippetDto snippetDto) {
        SnippetDto createdSnippet = snippetService.createSnippet(snippetDto);
        return ResponseEntity.ok(createdSnippet);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SnippetDto> updateSnippet(@PathVariable Long id, 
                                                   @Valid @RequestBody SnippetDto snippetDto) {
        return snippetService.updateSnippet(id, snippetDto)
                .map(snippet -> ResponseEntity.ok().body(snippet))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSnippet(@PathVariable Long id) {
        if (snippetService.deleteSnippet(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<SnippetDto>> searchSnippets(@RequestParam String query) {
        List<SnippetDto> snippets = snippetService.searchSnippets(query);
        return ResponseEntity.ok(snippets);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = snippetService.getStatistics();
        return ResponseEntity.ok(stats);
    }
}