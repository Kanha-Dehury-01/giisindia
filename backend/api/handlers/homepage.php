<?php

declare(strict_types=1);

/** Aggregated homepage payload: hero slides, section visibility/order, and headline statistics. */
function homepage_get(array $params): void
{
    $slides = db()->query(
        "SELECT id, slide_order, eyebrow, heading, description, cta_label, cta_url, svg_asset_key
         FROM hero_slides WHERE publish_status = 'published' ORDER BY slide_order ASC"
    )->fetchAll();

    $sections = db()->query(
        'SELECT section_key, is_visible, custom_heading, custom_description, display_order
         FROM homepage_sections ORDER BY display_order ASC'
    )->fetchAll();

    $stats = db()->query(
        'SELECT label, value, suffix, icon FROM statistics ORDER BY display_order ASC'
    )->fetchAll();

    json_success([
        'hero_slides' => $slides,
        'sections' => $sections,
        'statistics' => $stats,
    ]);
}
