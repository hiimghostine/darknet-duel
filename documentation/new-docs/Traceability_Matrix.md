# Traceability Matrix
## for Darknet Duel Web-Based Card Game

---

### Change History

| Version | Date       | Description         | Author           |
|---------|------------|---------------------|------------------|
| 1.0     | 2025-01-XX | Initial traceability matrix linking requirements to design and implementation | Development Team |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Traceability Matrix](#2-traceability-matrix)
3. [Legend and Definitions](#3-legend-and-definitions)
4. [Coverage Analysis](#4-coverage-analysis)

---

## 1. Introduction

This Traceability Matrix provides a comprehensive mapping between the requirements defined in the Requirements Refactoring Framework and the SRS elements, SDD design elements, implementation modules, and test cases. It ensures that every requirement is properly linked to its specification, design, implementation, and can be validated through testing.

### 1.1 Purpose
- Establish clear traceability between requirements and implementation
- Ensure complete coverage of all requirements
- Enable systematic validation and verification
- Support change impact analysis

### 1.2 Scope
The matrix covers all 20 requirements from the Requirements Refactoring Framework, mapping them to:
- SRS references (use cases, activity diagrams, wireframes) - many marked as TBA until SRS is expanded
- SDD design references (UML diagrams, ERDs, sequence diagrams, user interfaces, databases) - many marked as TBA until SDD is expanded
- Implementation modules and components - many marked as TBA until implementation begins
- Test case identifiers (TBA until STD is created)
- Implementation status

---

## 2. Traceability Matrix

### Requirements Traceability Matrix

| Requirement ID | SRS Reference (Use Cases, Activity Diagrams, Wireframes) | SDD Reference (Class Diagrams, Sequence Diagrams, User Interfaces, Databases) | Implementation Module(s)/Component(s) | STD Reference (Test Case IDs) | Status |
|----------------|----------------------------------------------------------|------------------------------------------------------------------------------|----------------------------------------|--------------------------------|---------|
| **REQ-101** | Module 1: User Management Use Cases<br/>- User Registration Activity Diagram<br/>- User Login Activity Diagram<br/>- Profile Management Wireframes | Module 1: User Management Design<br/>- transaction1_1_class.puml<br/>- transaction1_2_class.puml<br/>- transaction1_3_class.puml<br/>- transaction1_4_class.puml | backend-server/src/services/<br/>- account.service.ts<br/>- auth.service.ts<br/>- admin.service.ts | TBA | Pending |
| **REQ-102** | Module 1-7: API Integration Use Cases<br/>- REST API Activity Diagrams<br/>- WebSocket Connection Diagrams | Module 1-7: API Endpoint Design<br/>- All transaction sequence diagrams<br/>- REST API specifications | backend-server/src/routes/<br/>- account.routes.ts<br/>- auth.routes.ts<br/>- admin.routes.ts<br/>game-server/src/server/<br/>- cardDataRoutes.ts | TBA | Pending |
| **REQ-103** | Module 1-7: User Journey Use Cases<br/>- Complete User Workflow Diagrams<br/>- Integration Flow Wireframes | Module 1-7: User Workflow Design<br/>- Complete user journey diagrams<br/>- Integration flow diagrams | darknet-duel-frontend/src/<br/>- components/<br/>- pages/<br/>- hooks/<br/>- services/ | TBA | Pending |
| **REQ-104** | Module 4: Game Logic Use Cases<br/>- Card Interaction Activity Diagrams<br/>- Game State Transition Diagrams | Module 4: Card System Design<br/>- Card interaction diagrams<br/>- Game state diagrams | game-server/src/game/<br/>- cards/<br/>- core/<br/>- moves/<br/>- utils/ | TBA | Pending |
| **REQ-105** | TBA | TBA | .github/workflows/<br/>- security-scan.yml<br/>.zap/rules.tsv | TBA | Pending |
| **REQ-201** | TBA | TBA | TBA | TBA | Pending |
| **REQ-202** | TBA | TBA | TBA | TBA | Pending |
| **REQ-203** | TBA | TBA | TBA | TBA | Pending |
| **REQ-204** | TBA | TBA | TBA | TBA | Pending |
| **REQ-205** | TBA | TBA | TBA | TBA | Pending |
| **REQ-206** | TBA | TBA | TBA | TBA | Pending |
| **REQ-207** | TBA | TBA | TBA | TBA | Pending |
| **REQ-301** | TBA | TBA | backend-server/src/<br/>- config/swagger.ts<br/>- All route files with annotations | TBA | Pending |
| **REQ-302** | TBA | TBA | TBA | TBA | Pending |
| **REQ-303** | TBA | TBA | TBA | TBA | Pending |
| **REQ-304** | TBA | TBA | TBA | TBA | Pending |
| **REQ-401** | TBA | TBA | TBA | TBA | Pending |
| **REQ-402** | TBA | TBA | TBA | TBA | Pending |
| **REQ-403** | TBA | TBA | TBA | TBA | Pending |
| **REQ-404** | TBA | TBA | TBA | TBA | Pending |
| **REQ-405** | TBA | TBA | TBA | TBA | Pending |
| **REQ-406** | TBA | TBA | .github/workflows/<br/>- security-scan.yml<br/>- deploy.yml<br/>- ci.yml | TBA | Pending |

---

## 3. Legend and Definitions

### 3.1 Design Reference Types

| Design Type | Description | Location |
|-------------|-------------|----------|
| **Class Diagrams** | UML class diagrams showing component relationships | `moduleX/transactionX_Y/transactionX_Y_class.puml` |
| **ERD** | Entity Relationship Diagrams for database design | `moduleX/transactionX_Y/transactionX_Y_erd.puml` |
| **Sequence Diagrams** | UML sequence diagrams showing interaction flows | `moduleX/transactionX_Y/transactionX_Y_sequence.puml` |
| **Architecture Diagrams** | High-level system architecture | `architecture-block-diagram.puml` |

### 3.2 Code Module Categories

| Category | Description | Location |
|----------|-------------|----------|
| **Backend Services** | Business logic and data processing | `backend-server/src/services/` |
| **Backend Routes** | API endpoint definitions | `backend-server/src/routes/` |
| **Backend Entities** | Database models and ORM entities | `backend-server/src/entities/` |
| **Backend Middleware** | Request processing middleware | `backend-server/src/middleware/` |
| **Frontend Components** | React UI components | `darknet-duel-frontend/src/components/` |
| **Frontend Pages** | Page-level components | `darknet-duel-frontend/src/pages/` |
| **Frontend Hooks** | Custom React hooks | `darknet-duel-frontend/src/hooks/` |
| **Frontend Services** | API communication services | `darknet-duel-frontend/src/services/` |
| **Game Server** | Game logic and real-time features | `game-server/src/game/` |
| **Game Server Routes** | Game-specific API endpoints | `game-server/src/server/` |
| **Configuration** | System configuration files | Various config directories |
| **Workflows** | CI/CD and deployment workflows | `.github/workflows/` |

### 3.3 Status Definitions

| Status | Description | Next Action |
|--------|-------------|-------------|
| **Pending** | Requirement identified but not yet implemented | Begin implementation planning |
| **In Progress** | Implementation has started | Continue development |
| **Review** | Implementation complete, under review | Conduct code review |
| **Testing** | Under testing phase | Execute test cases |
| **Complete** | Fully implemented and tested | Mark as done |

---

## 4. Coverage Analysis

### 4.1 Requirements Coverage by Module

| Module | Requirements Covered | Coverage % | Status |
|--------|---------------------|------------|---------|
| **Module 1: User Management** | REQ-101, REQ-102, REQ-201, REQ-202, REQ-203, REQ-204, REQ-301, REQ-302, REQ-303, REQ-401, REQ-402, REQ-403, REQ-404, REQ-405 | 70% | Pending |
| **Module 2: Lobby & Matchmaking** | REQ-102, REQ-103, REQ-201, REQ-202, REQ-203, REQ-204, REQ-301, REQ-302, REQ-303, REQ-304, REQ-401, REQ-402, REQ-404, REQ-405 | 70% | Pending |
| **Module 3: Real-Time Game** | REQ-102, REQ-103, REQ-104, REQ-201, REQ-202, REQ-203, REQ-204, REQ-301, REQ-302, REQ-303, REQ-304, REQ-401, REQ-402, REQ-404, REQ-405 | 75% | Pending |
| **Module 4: Card System** | REQ-101, REQ-102, REQ-103, REQ-104, REQ-201, REQ-202, REQ-203, REQ-204, REQ-301, REQ-302, REQ-303, REQ-304, REQ-401, REQ-402, REQ-404, REQ-405 | 80% | Pending |
| **Module 5: Statistics** | REQ-101, REQ-102, REQ-103, REQ-201, REQ-202, REQ-203, REQ-204, REQ-301, REQ-302, REQ-303, REQ-401, REQ-402, REQ-404, REQ-405 | 70% | Pending |
| **Module 6: Store & Currency** | REQ-101, REQ-102, REQ-103, REQ-201, REQ-202, REQ-203, REQ-204, REQ-301, REQ-302, REQ-303, REQ-401, REQ-402, REQ-404, REQ-405 | 70% | Pending |
| **Module 7: Admin & Moderation** | REQ-101, REQ-102, REQ-103, REQ-201, REQ-202, REQ-203, REQ-204, REQ-301, REQ-302, REQ-303, REQ-401, REQ-402, REQ-403, REQ-404, REQ-405 | 75% | Pending |

### 4.2 Requirements Coverage by Goal

| Goal | Requirements | Coverage % | Status |
|------|--------------|------------|---------|
| **G1: Test Coverage** | REQ-101, REQ-102, REQ-103, REQ-104, REQ-105 | 100% | Pending |
| **G2: Error Handling & UX** | REQ-201, REQ-202, REQ-203, REQ-204, REQ-205, REQ-206, REQ-207 | 100% | Pending |
| **G3: API Documentation** | REQ-301, REQ-302, REQ-303, REQ-304 | 100% | Pending |
| **G4: Security & Compliance** | REQ-401, REQ-402, REQ-403, REQ-404, REQ-405, REQ-406 | 100% | Pending |

### 4.3 Implementation Priority Analysis

| Priority Level | Requirements Count | Estimated Effort | Dependencies |
|----------------|-------------------|------------------|--------------|
| **Must (Critical)** | 16 | High | Core system functionality |
| **Should (Important)** | 4 | Medium | Enhanced user experience |
| **Could (Nice to have)** | 0 | N/A | N/A |
| **Won't (Future)** | 0 | N/A | N/A |

---

## 5. Next Steps

### 5.1 Immediate Actions
1. **Expand SRS** to include use cases, activity diagrams, and wireframes for new requirements
2. **Expand SDD** to include design diagrams and specifications for new requirements
3. **Create Software Test Document (STD)** to replace TBA entries
4. **Begin implementation** of Must-priority requirements
5. **Set up development environment** for new components
6. **Establish testing framework** for automated validation

### 5.2 Implementation Order
1. **Week 1-2**: G1 requirements (testing infrastructure)
2. **Week 3-4**: G2 requirements (error handling, tutorial system)
3. **Week 5**: G3 requirements (API documentation)
4. **Week 6-7**: G4 requirements (security hardening)

### 5.3 Success Criteria
- All requirements have complete traceability
- Test cases cover 100% of requirements
- Implementation status progresses from Pending to Complete
- Coverage analysis shows 100% across all modules

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Next Review:** Weekly during implementation phase  
**Next Update:** After STD creation and test case assignment

