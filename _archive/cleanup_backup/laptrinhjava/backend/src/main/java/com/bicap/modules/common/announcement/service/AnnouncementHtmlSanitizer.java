package com.bicap.modules.common.announcement.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;

public final class AnnouncementHtmlSanitizer {

    private static final Safelist SAFELIST = Safelist.none()
            .addTags("p", "br", "ul", "ol", "li", "strong", "em", "b", "i", "u", "a", "blockquote", "h1", "h2", "h3", "h4")
            .addAttributes("a", "href", "title", "rel")
            .addProtocols("a", "href", "http", "https", "mailto");

    private AnnouncementHtmlSanitizer() {}

    public static String sanitize(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }

        return Jsoup.clean(html, "", SAFELIST, new Document.OutputSettings().prettyPrint(false));
    }
}
