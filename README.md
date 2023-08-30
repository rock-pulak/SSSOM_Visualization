# SSSOM Visualization
This is a project currently in development for the [Simple Standard for Sharing Ontology Mappings](https://github.com/mapping-commons/sssom).
The goal of the project is to host a static webpage into which SSSOM-compliant mappings can be loaded and easily interpreted.

## Current features
- Loading data at runtime from a user-side file, or load a demo data sheet
- Display basic information about individual Subject-Predicate-Object mappings
  - Defaults to loading Subject and Object by subject_label and object_label field, with ID field visible on mouse hover
  - If subject_label or object_label is absent, displays subject_id or object_id field directly
- Display advanced data about specific entries on click
- Parse 1-to-n and n-to-1 entries (Mappings where one entry in one ontology corresponds to multiple mappings in the other)
- Allow users to expand full text of entries or hide text for more compact viewing
- Sort entries alphabetically by subject name and predicate type

## Upcoming features
- Allow users to search for specific entries and use more advanced sorting/filtering options

## Notes
- ncit_icd10_2017.sssom.tsv provided courtesy of the mapping commons: https://github.com/mapping-commons/disease-mappings/tree/main/mappings
