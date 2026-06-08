import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CreateTeamDocumentDto } from '../dto/team-document.dto.js';

const successResponse = ApiResponse({
    status: 200,
    description: 'Success',
});

const createdResponse = ApiResponse({
    status: 201,
    description: 'Success',
});

const deletedResponse = ApiResponse({
    status: 203,
    description: 'Successfully deleted'
})

const badRequestResponse = ApiResponse({
    status: 400,
    description: 'Bad Request',
});

const notFoundResponse = ApiResponse({
    status: 404,
    description: 'Not Found',
});

const forbiddenResponse = ApiResponse({
    status: 403,
    description: 'Forbidden',
});

export function ApiCreateTeamSwaggerDecorator() {
    return applyDecorators(
        successResponse,
        badRequestResponse,
        ApiOperation({ summary: 'Create a new team' })
    );
}

export function ApiListTeamsSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'List teams for current user' }),
        ApiQuery({
            name: 'skip',
            required: false,
            type: Number,
            description: 'Number of teams to skip for pagination',
        }),
        ApiQuery({
            name: 'take',
            required: false,
            type: Number,
            description: 'Number of teams to take for pagination (max 100)',
        }),
        successResponse
    );
}

export function ApiGetTeamSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Get team details by ID' }),
        successResponse,
        badRequestResponse,
        forbiddenResponse
    );
}

export function ApiUpdateTeamSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Update team information (ADMIN only)' }),
        successResponse,
        forbiddenResponse,
        badRequestResponse
    );
}

export function ApiDeleteTeamSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Delete team (owner only)' }),
        deletedResponse,
        forbiddenResponse,
        badRequestResponse
    )
}

export function ApiGetTeamMembersSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Get team members' }),
        successResponse,
        ApiQuery({
            name: 'skip',
            required: false,
            type: Number,
            description: 'Number of teams to skip for pagination',
        }),
        ApiQuery({
            name: 'take',
            required: false,
            type: Number,
            description: 'Number of teams to take for pagination (max 100)',
        }),
        forbiddenResponse
    )
}

export function ApiAddTeamMemberSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Add member to team (ADMIN only)' }),
        createdResponse,
        badRequestResponse,
        forbiddenResponse
    );
}

export function ApiUpdateTeamMemberSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Update member role (ADMIN only)' }),
        successResponse,
        badRequestResponse,
        forbiddenResponse,
        ApiResponse({
            status: 404,
            description: 'Member not found',
        })
    )
}

export function ApiDeleteTeamMemberSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Remove member from team (ADMIN only)' }),
        ApiResponse({
            status: 204,
            description: 'Member removed successfully',
        }),
        badRequestResponse,
        forbiddenResponse,
        ApiResponse({
            status: 404,
            description: 'Member not found',
        })
    )
}

export function ApiCreateTeamDocumentSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Create document in team (EDITOR or ADMIN)' }),
        ApiResponse({
            status: 201,
            description: 'Document created successfully',
        }),
        ApiResponse({
            status: 400,
            description: 'Invalid request data',
        }),
        ApiResponse({
            status: 403,
            description: 'Insufficient permissions',
        }),
        ApiBody({ type: CreateTeamDocumentDto })
    )
}

export function ApiListTeamDocumentsSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'List documents in team' }),
        ApiResponse({
            status: 200,
            description: 'Documents retrieved successfully',
            isArray: true,
        }),
        ApiResponse({
            status: 403,
            description: 'Not a member of this team',
        }),
        ApiQuery({
            name: 'skip',
            required: false,
            type: Number,
            description: 'Number of team documents to skip for pagination',
        }),
        ApiQuery({
            name: 'take',
            required: false,
            type: Number,
            description: 'Number of team documents to take for pagination (max 100)',
        }),
    )
}

export function ApiGetTeamDocumentSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Get document from team' }),
        ApiResponse({
            status: 200,
            description: 'Document retrieved successfully',
        }),
        ApiResponse({
            status: 403,
            description: 'Access denied',
        }),
        ApiResponse({
            status: 404,
            description: 'Document not found',
        })
    )
}

export function ApiUpdateTeamDocumentSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Update document (EDITOR or ADMIN)' }),
        ApiResponse({
            status: 200,
            description: 'Document updated successfully',
        }),
        ApiResponse({
            status: 400,
            description: 'Invalid request data',
        }),
        ApiResponse({
            status: 403,
            description: 'Insufficient permissions',
        }),
        ApiResponse({
            status: 404,
            description: 'Document not found',
        })
    )
}

export function ApiDeleteTeamDocumentSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Delete document (EDITOR or ADMIN)' }),
        ApiResponse({
            status: 204,
            description: 'Document deleted successfully',
        }),
        ApiResponse({
            status: 403,
            description: 'Insufficient permissions',
        }),
        ApiResponse({
            status: 404,
            description: 'Document not found',
        })
    )
}

export function ApiListTeamDocumentVersionsSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({ summary: 'Get document version history' }),
        ApiResponse({
            status: 200,
            description: 'Version history retrieved successfully',
            isArray: true,
        }),
        ApiResponse({
            status: 403,
            description: 'Access denied',
        }),
        ApiResponse({
            status: 404,
            description: 'Document not found',
        }),
        ApiQuery({
            name: 'take',
            required: false,
            type: Number,
            description: 'Number of versions to take for pagination (max 100)',
        }),
        ApiQuery({
            name: 'skip',
            required: false,
            type: Number,
            description: 'Number of versions to skip for pagination',
        })
    )
}