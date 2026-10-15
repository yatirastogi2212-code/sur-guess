package com.surguess.service;

import com.surguess.model.Song;
import com.surguess.model.SongAlias;
import com.surguess.repository.SongAliasRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class MatchingService {

    private final SongAliasRepository songAliasRepository;

    public MatchingService(SongAliasRepository songAliasRepository) {
        this.songAliasRepository = songAliasRepository;
    }

    public static String normalize(String input) {
        if (input == null) return "";
        // 1. Unicode decomposition
        String decomposed = Normalizer.normalize(input, Normalizer.Form.NFKD);
        // 2. Remove combining diacritical marks
        String stripped = decomposed.replaceAll("\\p{M}", "");
        // 3. Remove zero-width chars (common in Indic fonts)
        stripped = stripped.replace("\u200B", "").replace("\u200C", "").replace("\u200D", "").replace("\uFEFF", "");
        // 4. Remove punctuation, hyphens, parentheses, quotes
        stripped = stripped.replaceAll("[\\p{Punct}&&[^']]", " ");
        stripped = stripped.replace("'", "");
        // 5. Replace multiple whitespace with single space and lowercase
        return stripped.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }

    public boolean matchesSong(String userGuess, Song song) {
        if (userGuess == null || song == null) return false;
        String normalizedGuess = normalize(userGuess);
        if (normalizedGuess.isEmpty()) return false;

        // 1. Check official English title
        String normTitleEn = normalize(song.getTitleEn());
        if (normTitleEn.equals(normalizedGuess)) return true;

        // 2. Check Hindi Devanagari title
        String normTitleHi = normalize(song.getTitleHi());
        if (normTitleHi.equals(normalizedGuess)) return true;

        // 3. Check known aliases in DB
        List<SongAlias> aliases = songAliasRepository.findBySongId(song.getId());
        for (SongAlias alias : aliases) {
            if (normalize(alias.getAliasText()).equals(normalizedGuess)) {
                return true;
            }
        }

        // 4. Conservative Levenshtein fallback on English title
        if (normTitleEn.length() >= 5 && isWithinLevenshteinThreshold(normTitleEn, normalizedGuess)) {
            return true;
        }

        return false;
    }

    private boolean isWithinLevenshteinThreshold(String target, String guess) {
        int targetLen = target.length();
        int guessLen = guess.length();
        if (Math.abs(targetLen - guessLen) > 2) return false;

        int dist = computeLevenshtein(target, guess);
        if (targetLen <= 8) {
            return dist <= 1;
        } else {
            return dist <= 2;
        }
    }

    public static int computeLevenshtein(String s1, String s2) {
        int[] prev = new int[s2.length() + 1];
        int[] curr = new int[s2.length() + 1];

        for (int j = 0; j <= s2.length(); j++) {
            prev[j] = j;
        }

        for (int i = 1; i <= s1.length(); i++) {
            curr[0] = i;
            for (int j = 1; j <= s2.length(); j++) {
                int cost = (s1.charAt(i - 1) == s2.charAt(j - 1)) ? 0 : 1;
                curr[j] = Math.min(Math.min(curr[j - 1] + 1, prev[j] + 1), prev[j - 1] + cost);
            }
            System.arraycopy(curr, 0, prev, 0, curr.length);
        }
        return prev[s2.length()];
    }
}
