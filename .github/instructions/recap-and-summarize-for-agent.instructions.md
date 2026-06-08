

<!-- Instructions for Agent to use this file and generate a recap and summary of code changes, so it can assist in creating a clear and informative overview of the code changes, next time it runs, it should be able to minimize the amount of tokens used -->

# Recap and Summarize Instructions

This instruction file provides guidelines for summarizing and recapping code changes based on the current working-tree changes (e.g., the current diff or changed files in the active review scope). Summarize only the files changed in the current diff; do not summarize unchanged files. Base the recap only on the current working-tree changes; do not summarize unrelated files in the repository.

When summarizing code changes, focus on the following key aspects:
1. **Core Features Implemented**: Highlight the main features that were added or modified in the codebase. This could include new services, models, API endpoints, or significant changes to existing functionality.
2. **Implementation Details**: Provide a brief overview of how the features were implemented, including any architectural patterns, design decisions, or important code snippets that illustrate the changes.
3. **Testing**: Summarize the testing strategy that was implemented to ensure the new features work as expected, such as unit tests, integration tests, or end-to-end tests.
4. **Documentation**: Mention any new documentation that was created or existing documentation that was updated to reflect the changes in the codebase, such as guides, API references, or technical specifications.
5. **Impact**: Summarize the impact of the changes. If the diff contains explicit quantitative evidence (e.g., test counts, benchmark results, or coverage percentages), include it; otherwise write 'No quantitative impact data was provided.'
Optionally include **Performance and Security** if the diff contains explicit changes in those areas.

When writing the summary, aim for clarity and conciseness. Use bullet points or tables to organize information where appropriate, and avoid including unnecessary technical details that may not be relevant to all stakeholders. The goal is to provide a clear and informative overview of the code changes that can be easily understood by both technical and non-technical team members. If no changes are found in the current diff, respond with: 'No code changes were detected.' If a section does not apply, write 'Not applicable' instead of inventing content.

Here is an example of how to structure the summary:

```
## Core Features Implemented
- Feature 1: Description of the feature and its purpose.
- Feature 2: Description of the feature and its purpose.
- Feature 3: Description of the feature and its purpose.

## Implementation Details
- Architectural pattern used (e.g., MVC, microservices, etc.)
- Key design decisions and rationale
- Important code snippets that illustrate the changes

## Documentation
- New documentation created (e.g., guides, API references)
- Existing documentation updated (e.g., technical specifications)

## Testing
- Testing strategy implemented (e.g., unit tests, integration tests)
- Summary of test coverage and results

## Performance and Security
- Performance optimizations made
- Security enhancements implemented
```

By following these guidelines, you can create a comprehensive and informative summary of code changes that will help team members and stakeholders understand the impact and significance of the changes made to the codebase. For edge cases such as empty diffs or missing sections, follow the above instructions to ensure consistent behavior.


