# Software Project Management Plan (SPMP) - Darknet Duel

## 1. Introduction

### 1.1 Project Overview

#### 1.1.1 Purpose, Scope, and Objectives

The purpose of the Darknet Duel project is to design, develop, implement, and test the complete application (frontend and backend) required to support the Darknet Duel cybersecurity-themed card game. This system will manage user authentication, player lobbies, card and deck data, game initialization, core gameplay logic, and the user interface for interaction.

The scope of this project encompasses all development activities, including frontend UI/UX design and implementation, backend API creation, database interaction, implementation of game rules, integration between frontend and backend, and associated testing and documentation. Activities outside the scope include creation of game assets (e.g., card art), detailed network infrastructure setup beyond the application level, and post-deployment operational maintenance. Specifically, it includes the development of modules for user management, lobby handling, card/deck management, and turn-based gameplay mechanics. Activities outside the scope include the development of the game assets (e.g., card art, UI elements), network infrastructure setup beyond the application level, and post-deployment operational maintenance.

The primary objectives of this project are:
*   Deliver a robust, scalable, and secure application capable of supporting multiplayer Darknet Duel games.
*   Successfully implement all features and functionalities outlined in the Software Requirements Specification (SRS) and the Software Design Document (SDD).
*   Ensure the final product adheres to high-quality software engineering standards, including SOLID, DRY, KISS, YAGNI principles, and OWASP security best practices.
*   Provide clear and comprehensive API documentation using Swagger for seamless integration with frontend clients.
*   Deliver all specified application components and documentation according to the project plan.

This project provides the foundational logic for the Darknet Duel game. It is designed to integrate with a separate frontend client via a defined RESTful API contract and WebSocket. The successful completion of this project will provide the necessary infrastructure for players to engage in the Darknet Duel card game. The official statement of product requirements can be found in the Software Requirements Specification (SRS).

#### 1.1.2 Assumptions and Constraints

This project is planned based on the following assumptions:
*   The frontend client application for Darknet Duel will be developed separately and will interact with the backend solely through the defined RESTful API.
*   The necessary development environment, including JDK 21, Gradle, a suitable IDE, Git, and access to a MySQL database, is readily available to the development team.
*   The existing Software Requirements Specification (SRS) and Software Design Document (SDD) provide accurate and stable definitions for the project's requirements and high-level design.
*   The development team possesses the required technical expertise in Java, Spring Boot, Spring Data JPA, REST API design, and MySQL.

The project operates under the following constraints:
*   **Technology Stack:** The application must be implemented using Java 21, Spring Boot 3+ (including Spring Web, Spring Data JPA, Spring WebSocket with STOMP), Gradle, Lombok, and Swagger. MySQL will be the database system.
*   **Development Principles:** Development must strictly adhere to SOLID, DRY, KISS, and YAGNI principles. OWASP best practices must be followed for security aspects.
*   **Architecture:** The application must follow the defined layered architecture (Controllers, Services, Repositories) using DTOs for data transfer between layers, as outlined in the development guidelines.
*   **Interfaces:** Interaction with the frontend will be exclusively through the RESTful API documented with Swagger. No direct coupling between backend and frontend code is permitted.
*   **Timeline:** As a university capstone project, the primary constraint is the academic calendar. The detailed schedule is outlined in section 1.1.4.
*   **Resources:** The project relies on the assigned student development team members, university resources (if applicable), and standard open-source libraries and tools. Budgetary constraints are minimal, primarily related to time allocation and potential minor expenses for software licenses or cloud services if required for deployment beyond local testing, which are expected to be negligible or covered by student/university resources.

#### 1.1.3 Project Deliverables

The successful completion of the Darknet Duel project will yield the following deliverables:
*   **Software:**
    *   Complete application source code (Java) integrated with the defined technology stack.
    *   Executable application artifact (e.g., JAR file).
    *   Database schema definitions (implicitly defined via JPA entities).
*   **Documentation:**
    *   Software Requirements Specification (SRS).
    *   Software Design Document (SDD).
    *   This Software Project Management Plan (SPMP).
    *   Automatically generated API Documentation via Swagger UI.
    *   Final Project Presentation/Demo materials.
*   **Delivery:** All deliverables will be provided electronically via access to the project's Git repository and potentially submitted through the university's course platform.

#### 1.1.4 Schedule and Budget Summary

The project follows a strict academic schedule defined by the university course requirements. The key milestones and deliverables are aligned with the following timeline:

| Week | Dates           | Deliverable / Activity         | Checking Period   |
| :--- | :-------------- | :----------------------------- | :---------------- |
| 1    | Jan 20 - 25     | Team Formation                 | Jan 20 - 25       |
| 2-3  | Jan 27 - Feb 8  | Review of Related Literature   | Jan 27 - 31       |
| 3    | Feb 3 - 8       | Patent Search                  | Feb 3 - 8         |
| 4    | Feb 10 - 15     | Software Project Proposal      | Feb 10 - 15       |
| 5    | Feb 17 - 22     | Software Requirements Specification | Feb 17 - 22       |
| 6    | Feb 24 - 29     | Software Project Management Plan | Feb 24 - 29       |
| 7    | Mar 3 - 8       | Software Design Description    | Mar 3 - 8         |
| 8-9  | Mar 24 - Apr 5  | INC 1 Module Implementation    | Mar 24 - Apr 5    |
| 10-11| Apr 7 - Apr 19  | INC 2 Module Implementation    | Apr 7 - Apr 19    |
| 12-13| Apr 22 - May 3  | INC 3 Module Implementation    | Apr 22 - May 3    |
| 14-15| May 5 - May 17  | INC 4 Module Implementation    | May 5 - May 17    |
| 16-18| May 20 - May 31 | Software Project Demo/Presentation | May 20 - May 31   |

*[Table 1.1] Capstone Project Schedule*

As of the current date (May 3, 2025), the project is within the **INC 3** implementation period. INC 4 is allocated for the completion of remaining development modules and final integration/testing.

Budgetary considerations are minimal for this academic project. Costs are primarily related to the time investment of the team members and potential minor expenses for software licenses or cloud services if required for deployment beyond local testing, which are expected to be negligible or covered by student/university resources.

### 1.2 Evolution of the Plan

This SPMP is a living document and will be updated by the project team as necessary throughout the project lifecycle, particularly if significant deviations from the plan occur. Scheduled reviews and potential updates may occur at the transition points between implementation increments (INC).

All updates to the SPMP will be managed through the project's GitHub repository. Version history will track changes made to the document. Significant updates will be communicated to all team members during regular project meetings or via designated communication channels .

| Version | Primary Author(s)       | Description of Version                     | Date       |
| :------ | :---------------------- | :----------------------------------------- | :--------- |
| 0.1     | Project Team            | Initial draft based on project proposal    | Feb 2025   |
| 1.0     | Project Team            | Final version for submission               | Feb 29, 2025 |
| 1.1     | Project Team            | Updated post-SDD development (Optional)    | Mar 2025   |
| 1.2     | Project Team            | Reflecting progress up to INC 3 (This update)| May 3, 2025 |

*[Table 1.2] SPMP Evolution Plan*

## 2. References

This section lists documents and standards referenced within this SPMP or relevant to the project.

1.  **Darknet Duel Software Requirements Specification (SRS)**: Defines functional and non-functional requirements for the project.
2.  **Darknet Duel Software Design Document (SDD)**: Outlines the high-level architecture and design decisions for the backend system.
3.  **IEEE Standard for Software Project Management Plans (IEEE Std 1058-1998)**: Standard providing the structure and guidance for this document.
4.  **Spring Framework Documentation**: Relevant versions for Spring Boot 3+, Spring Data JPA, Spring Security. ([https://spring.io/projects/spring-framework](https://spring.io/projects/spring-framework))
5.  **OWASP Top Ten**: ([https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)) (Guidance for security best practices).
6.  **Java 21 Documentation**: ([https://docs.oracle.com/en/java/javase/21/](https://docs.oracle.com/en/java/javase/21/))

## 4. Project Organization

This section describes the project's team structure, roles, and relationships.

### 4.1 External Interfaces

As a university capstone project, the primary external interface is with the course instructor/faculty advisor(s), who provide guidance, evaluate deliverables, and oversee project progress according to academic requirements. The project may also reference university policies or resources related to capstone projects. There are no external commercial clients or subcontractors involved.

The application developed is intended to potentially interface with a separate frontend application (its development possibly being handled by another team or deferred) via both a RESTful API (for standard requests) and WebSocket connections (for real-time game updates). It also relies on standard external libraries and a MySQL database instance.

### 4.2 Internal Structure

The Darknet Duel capstone team consists of five members:

*   **Project Lead:** Matthew Emmanuel O. Echavez
*   **Developers:**
    *   Brian Steve E. Pila
    *   Kenjie B. Bentain
    *   Ephraim Jay A. Solasco
    *   Scott Benzer Gitgano

The team operates collaboratively, with the Project Lead responsible for overall coordination, task assignment tracking (potentially using tools like ClickUp as mentioned in the schedule context), ensuring adherence to the schedule, facilitating communication, and leading the integration of modules. All members contribute to development, testing, and documentation activities.

### 4.3 Roles and Responsibilities

While all members participate across activities, primary responsibilities are assigned as follows:

*   **Project Lead (Matthew Emmanuel O. Echavez):**
    *   Oversees the project plan and schedule.
    *   Coordinates team meetings and communication.
    *   Manages the main code repository branch and integration.
    *   Leads documentation efforts (SRS, SDD, SPMP, final reports).
    *   Assigns tasks and tracks progress.
    *   Serves as the primary point of contact with faculty advisors.
    *   Contributes to development and testing.
*   **Developers (Brian Steve E. Pila, Kenjie B. Bentain, Ephraim Jay A. Solasco, Scott Benzer Gitgano):**
    *   Implement assigned software modules according to the SDD and coding standards.
    *   Develop and execute unit and integration tests for their code.
    *   Participate in code reviews (peer reviews).
    *   Contribute to the development of end-to-end tests.
    *   Assist with documentation related to their modules.
    *   Report progress and potential issues to the Project Lead.
    *   Collaborate on troubleshooting and integration challenges.

Specific module assignments will be determined by the Project Lead based on the Work Breakdown Structure and team member skills/preferences, managed potentially via ClickUp or similar task management tools.

## 5. Managerial Process Plans

This section details the plans for managing the project execution, covering start-up, risk management, work planning, control mechanisms, and closeout procedures.

### 5.1 Start-up Plan

This initial phase outlines the planning for project estimation, staffing needs, resource acquisition, and any required training.

#### 5.1.1 Estimation Plan

Project estimation is primarily based on the breakdown of work defined in the academic schedule (Section 1.1.4) and the complexity outlined in the Software Requirements Specification (SRS) and Software Design Document (SDD). Each major deliverable (SRS, SPMP, SDD, INC 1-4) has allocated timeframes. Estimation within the implementation increments (INC 1-4) considers the complexity of features within the assigned modules, dependencies, and the anticipated effort for coding, testing, and documentation. The team's collective experience and collaborative nature are factored in. Estimates are refined collaboratively during weekly team meetings as work progresses.

#### 5.1.2 Staffing Plan

The project is staffed by the pre-defined 5-member capstone team, as listed in Section 4.2. All members are expected to dedicate sufficient time as required by the capstone course requirements throughout the project duration. The team composition is fixed for the project's duration.

#### 5.1.3 Resource Acquisition Plan

Required resources include:
*   **Hardware:** Each team member will use their personal computers equipped for software development.
*   **Software:** Standard development tools (JDK 21, IDEs like IntelliJ IDEA or VS Code, Git, Gradle, MySQL Community Server or equivalent), communication tools (primarily Microsoft Teams), and a task management tool (ClickUp). All core development software is open-source or available via free licenses (e.g., student licenses for IDEs).
*   **Information:** Access to university library resources for literature review, online documentation for technologies used (Spring, Java, etc.), and guidance from faculty advisors.

Resource acquisition involves installing necessary software on personal machines. No significant procurement is anticipated.

#### 5.1.4 Project Staff Training Plan

No formal training plan is required, as team members are assumed to possess the necessary foundational knowledge in software development, Java, and related technologies required for the capstone project based on prior coursework. Skill gaps or learning related to specific framework features (e.g., advanced Spring Data JPA techniques) will be addressed through self-study, peer-to-peer knowledge sharing within the team, and referencing online documentation and tutorials.

### 5.2 Work Plan

This section specifies the detailed work activities, scheduling, resource allocation, and budget considerations for the Darknet Duel project.

#### 5.2.1 Work Activities

The project work is broken down according to the major phases defined in the academic schedule (Section 1.1.4). The core development work is structured into four implementation increments (INC 1-4). A more detailed Work Breakdown Structure (WBS) focusing on the implementation might look like this (specific module allocation within INCs determined by the team, covering modules like User Auth, Lobby, Real-time Communication, Game Engine, Cards, Stats as defined in SRS/SDD):

| Phase                 | WBS ID | Task / Module                      | Key Activities                                         |
| :-------------------- | :----- | :--------------------------------- | :----------------------------------------------------- |
| **Setup & Planning**  | 1.0    | Initial Setup & Documentation      | Literature Review, Proposal, SRS, SPMP, SDD, Env Setup |
| **Implementation INC 1** | 2.0    | Foundational Modules               | e.g., User Auth, Core Entities, Basic Config         |
|                       | 2.1    | Module 1 Implementation            | Code, Unit Tests, Integration Tests, Peer Review     |
|                       | 2.2    | Module 2 Implementation            | Code, Unit Tests, Integration Tests, Peer Review     |
| **Implementation INC 2** | 3.0    | Core Gameplay/Lobby Modules      | e.g., Lobby Creation, Card Management                |
|                       | 3.1    | Module 3 Implementation            | Code, Unit Tests, Integration Tests, Peer Review     |
|                       | 3.2    | Module 4 Implementation            | Code, Unit Tests, Integration Tests, Peer Review     |
| **Implementation INC 3** | 4.0    | Advanced Gameplay/Integration    | e.g., Turn Logic, Game State, API Refinements        |
|                       | 4.1    | Module 5 Implementation            | Code, Unit Tests, Integration Tests, Peer Review     |
|                       | 4.2    | Module 6 Implementation            | Code, Unit Tests, Integration Tests, Peer Review     |
|                       | 4.3    | Initial End-to-End Testing       | Setup E2E framework, Write initial tests           |
| **Implementation INC 4** | 5.0    | Remaining Modules & Finalization | e.g., Advanced Features, Bug Fixing, Polish        |
|                       | 5.1    | Module X Implementation            | Code, Unit Tests, Integration Tests, Peer Review     |
|                       | 5.2    | Comprehensive E2E Testing        | Expand test coverage, Run full suite             |
|                       | 5.3    | Final Documentation & Packaging  | Update README, Final checks, Build artifact        |
| **Demo & Delivery**   | 6.0    | Project Demonstration              | Prepare presentation, Conduct demo, Final Submission |

*[Table 5.1] High-Level Work Breakdown Structure*

Detailed task breakdowns within each module implementation will be managed by the team, potentially using a task board or list in ClickUp or a similar tool, ensuring coverage of all required modules including real-time communication aspects.

#### 5.2.2 Schedule Allocation

The allocation of schedule adheres strictly to the timeline provided in Section 1.1.4. Each INC spans approximately two weeks, requiring focused effort from the team members to complete the planned modules within that timeframe. The Project Lead is responsible for monitoring progress against this schedule during weekly meetings.

#### 5.2.3 Resource Allocation

Team members (human resources) are allocated across all implementation increments. Specific task assignments within each INC will be managed by the Project Lead. Software and hardware resources are available throughout the project duration. No specialized resources requiring specific scheduling constraints are anticipated.

#### 5.2.4 Budget Allocation

As stated in Section 1.1.4, the project operates with a minimal budget. No specific budget allocation per phase is required beyond managing team time effectively.

### 5.3 Control Plan

This section outlines the metrics, reporting methods, and control procedures used to manage the project's requirements, schedule, budget (implicitly time/effort), quality, risks, and eventual closeout, consistent with the collaborative and academic nature of the project.

#### 5.3.1 Requirements Control Plan

Control over product requirements is maintained through adherence to the defined Software Requirements Specification (SRS) and Software Design Document (SDD). Any proposed changes or clarifications identified during development will be discussed within the team during meetings. The Project Lead holds the final authority on accepting requirement modifications. Approved changes that impact scope or design must be reflected in updates to the SRS and/or SDD. The potential impact of any change on schedule and effort will be assessed during these discussions. All changes to requirements documentation and related code will be tracked via Git commits, providing traceability. The primary mechanism for control is the Project Lead's oversight and the explicit goal of implementing the features as documented, avoiding scope creep unless formally approved and documented.

#### 5.3.2 Schedule Control Plan

Schedule control focuses on monitoring progress against the module completion milestones outlined in Table 1.1. Progress within a module is measured by the completion of features and associated test cases. At the end of each module development cycle (approximately every 2-3 weeks), the Project Lead will assess the achieved functionality against the plan. Objective criteria include successfully running the module's test suite and demonstrating the core features. If significant delays occur (e.g., a module overruns by a week or more), the Project Lead and team will analyze the cause and determine corrective actions, which might involve adjusting priorities for the next module or simplifying non-critical features if permissible within the overall requirements. Progress tracking is mainly informal through regular interaction and observing completed tasks, supplemented by the milestone reviews.

#### 5.3.3 Resource Control Plan

Human resources (team members' time and effort) are the primary controlled resource. The Project Lead monitors task completion and workload distribution during weekly meetings to ensure resources are utilized effectively and to identify potential bottlenecks or overburdened members. Software and hardware resources are generally available and require minimal control beyond ensuring necessary tools are installed and functional.

#### 5.3.4 Quality Control Plan

Quality control is implemented through several mechanisms integrated into the development process. Adherence to coding standards (SOLID, DRY, KISS, YAGNI) and security best practices (OWASP) is a primary focus, enforced through Project Lead guidance and review of team members' output.

Comprehensive automated testing (unit, integration, end-to-end) forms a core part of the QA strategy, providing continuous feedback on code quality and functional correctness. Verification activities, particularly Project Lead code reviews and design adherence checks, are integral to assuring quality. Validation testing ensures the product meets user needs.

The QA process is directly linked to V&V activities, configuration management (ensuring code integrity), and reviews (Project Lead oversight). There is no separate QA team; quality is a shared responsibility, primarily driven by the Project Lead's standards and oversight and team members' adherence to instructions and best practices.

#### 5.3.5 Reporting Plan

Progress reporting occurs primarily through:
*   **Weekly Team Meetings:** Each member reports on completed tasks, current work, and any impediments. The Project Lead summarizes overall progress against the schedule.
*   **Version Control Commits:** Git commit messages provide a granular log of development activity.
*   **Task Management Tool Updates:** If used (e.g., ClickUp), the status of tasks provides visibility into progress.
*   **Milestone Deliverables:** Submission of major documents (SRS, SDD, SPMP) and demonstration of functionality at the end of INCs serve as formal progress indicators for faculty advisors.

Formal reports beyond the required academic submissions are not planned.

#### 5.3.6 Metrics Collection Plan

Metrics collection will be kept simple for this academic project:
*   **Schedule Adherence:** Tracking completion of major milestones and INC goals against the planned dates (Section 1.1.4).
*   **Functionality Completion:** Tracking the number of planned features/user stories implemented per INC.
*   **Test Results:** Monitoring pass/fail rates of unit, integration, and end-to-end tests.
*   **(Optional) Code Metrics:** Basic metrics like lines of code or cyclomatic complexity might be tracked using IDE plugins or build tools if deemed useful by the team, but are not a primary focus.

Metrics will be reviewed during weekly team meetings to inform progress assessment and identify potential issues.

#### 5.3.7 Risk Management Plan

Risk management involves the ongoing identification, analysis, and mitigation of potential issues that could negatively impact the project. Initial risks identified include: technical challenges in specific modules, integration difficulties between components developed by different members, inaccurate estimations leading to schedule slippage, team member availability issues (due to other coursework or personal matters), unclear requirements interpretation, and environment/tool setup problems.

Risks will be managed proactively. The Project Lead and team will identify emerging risks during development discussions. The Project Lead will prioritize risks based on potential impact and likelihood. Mitigation strategies may involve breaking down complex tasks into smaller steps, allocating additional time for research or complex implementations, performing careful integration testing, strictly controlling scope via the requirements control plan, leveraging team members' ability to quickly refactor or generate alternatives, and maintaining clear communication. High-priority risks and their status will be discussed as needed. This risk management process is embedded within the regular development workflow rather than being a separate periodic activity.

#### 5.3.8 Project Closeout Plan

Orderly project closeout will occur upon completion of all development and final testing activities, aligned with the end of the project timeline. The closeout plan includes several key steps. First, the Project Lead will ensure all final code, tests, and documentation updates are committed to the Git repository. A final execution of the complete test suite will verify the system's state. The Project Lead will perform a final review of key documentation, particularly the README.md for completeness and accuracy of setup/run instructions, and ensure Swagger documentation is up-to-date. The project's Git repository will serve as the official archive for all source code, documentation, and configuration files. Finally, an informal post-mortem or reflection may occur among the team to discuss lessons learned during the project. No formal staff reassignment or extensive archiving procedures beyond securing the Git repository are required.

## 6. Technical Process Plans

This clause specifies the development process model, technical methods, tools, techniques, infrastructure, and the product acceptance plan for the Darknet Duel project.

### 6.1 Process Model

The development process follows a collaborative, iterative model adapted for a student capstone team. The project is broken down into distinct modules based on the features outlined in the Software Requirements Specification (SRS) and the structure defined in the Software Design Document (SDD). Development proceeds through the four major implementation increments (INC 1-4) defined in the schedule (Section 1.1.4).

Within each increment, the workflow typically involves:
1.  **Task Assignment:** The Project Lead assigns specific features or sub-modules to developers.
2.  **Development:** Developers implement the assigned functionality, adhering to coding standards and design principles.
3.  **Unit/Integration Testing:** Developers write and execute tests for their code.
4.  **Code Review:** Peer reviews are conducted among team members (e.g., using Git pull requests or pair programming sessions) to ensure quality and knowledge sharing.
5.  **Integration:** Code is merged into the main development branch.
6.  **End-to-End Testing:** As functionality becomes available, end-to-end tests are developed and executed.
7.  **Iteration Review:** The team reviews progress at the end of minor cycles (e.g., weekly) and adjusts plans as needed.

Communication and collaboration occur through regular team meetings, shared code repositories (Git), and communication channels (e.g., group chat, shared workspace).

### 6.2 Methods, Tools, and Techniques

The project employs a combination of modern development methodologies, languages, tools, and techniques to ensure a high-quality application. 

**Methods and Techniques**

| Category                     | Methods and Techniques                                                                                              |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| **Project Methodology**      | Agile-inspired iterative development, Frequent team feedback/communication                                            |
| **Development Principles**   | SOLID, DRY, KISS, YAGNI, OWASP Security Best Practices                                                            |
| **Requirements Elicitation** | Analysis of SRS and SDD documents, Team discussions within shared workspace                                       |
| **Design**                   | Layered Architecture (Backend), Component-based Architecture (Frontend), UML (Class, ERD, Sequence Diagrams), PlantUML |          |
| **Implementation**           | Backend: Java 21, Frontend: React.js, DTO pattern for data transfer, Adherence to team coding standards           |
| **Testing**                  | Unit Testing (JUnit/Mockito, Jest/RTL), Integration Testing (Spring Test), End-to-End API Testing (Python/requests) |
| **API Documentation**        | In-code annotations using Swagger/OpenAPI                                                                         |
| **Database Interaction**     | Object-Relational Mapping (JPA), JPQL for custom queries                                                          |

*[Table 6.2.1] Methods and Techniques*

**Tools**

| Category                     | Tools                                                                                                     |
| :--------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Operating System**         | Developer's Preferred OS (Windows, macOS, Linux)                                                            |
| **Languages**                | Java 21, JavaScript (ES6+), SQL (via JPA/JPQL), Python 3 (for testing scripts)                             |
| **Frameworks/Libraries**     | Spring Boot 3+ (Web, Data JPA, WebSocket, Test), React.js, Lombok, JUnit 5, Mockito, STOMP.js (Frontend) |             |
| **Database**                 | MySQL                                                                                                     |
| **Build Tool**               | Gradle                                                                                                    |
| **Design Notation**          | PlantUML (for diagram generation), Markdown                                                                 |
| **Configuration Management** | Git, GitHub                                                                                               |
| **Documentation Tools**      | Markdown Editors, Swagger UI (for API visualization)                                                        |
| **Development Environment**  | Windsurf Workspace, IntelliJ IDEA / VS Code (or other IDEs), Postman (API testing)                        |
| **Project Planning/Tracking**| GitHub Projects/Issues (potential), Team Communication Tools within Workspace                             |

*[Table 6.2.2] Tools*

Technical standards governing development are derived from the established team preferences (coding styles, architectural patterns like DTO usage) and general Java/Spring/React best practices.

### 6.3 Infrastructure Plan

The project infrastructure primarily relies on the team members' local development environments and the capabilities provided by the shared workspace environment. The local setup consists of a Windows operating system equipped with the necessary software: Java Development Kit (JDK) 21, a suitable Integrated Development Environment (IDE) chosen by the team, Git client, and a running MySQL database server instance. The server-side application requires an environment capable of running the Spring Boot application and supporting persistent WebSocket connections (typically handled by the embedded Tomcat or a similar application server).

Establishment and maintenance of the local hardware and software environment, including operating system updates, IDE configuration, and database administration, are the responsibility of each team member. No dedicated physical servers, specialized hardware, or office facilities are provisioned specifically for this project beyond the team's standard setup. Network connectivity is assumed to be available for accessing dependencies via Gradle, utilizing the shared workspace environment, and maintaining stable WebSocket connections during testing and gameplay.

### 6.4 Product Acceptance Plan

Acceptance of the Darknet Duel application will be determined through team validation upon the completion of each development module and following the final integration phase. The primary method for acceptance involves the successful execution of the comprehensive test suite associated with each module and the overall system, demonstrating functional correctness and adherence to requirements. Objective criteria include: 100% pass rate for all defined automated tests (unit, integration, end-to-end), team confirmation that the implemented features behave as specified in the Software Requirements Specification (SRS) and Software Design Document (SDD) through manual testing or review, and adherence to the agreed-upon coding standards and architectural patterns.

Formal acceptance is achieved implicitly when the team approves the state of a completed module or the final integrated product, indicating readiness to proceed or conclude the project. No separate formal acceptance documentation or sign-off ceremony is planned, relying instead on the iterative validation and ongoing communication within the shared workspace environment. Testing tools (JUnit, Mockito, Spring Test, Python (`requests` library), Swagger, Git, and the team's chosen IDEs) and code inspection by the team are the core techniques used for acceptance verification.

## 7. Supporting Process Plans

This clause details the supporting processes essential for the successful execution of the Darknet Duel project throughout its lifecycle. These plans cover configuration management, verification and validation, documentation, quality assurance, reviews, problem resolution, and process improvement. Subcontractor management is not applicable and thus not planned.

### 7.1 Configuration Management Plan

Configuration management (CM) for this project is centered around the use of Git for version control, likely hosted on a platform like GitHub, GitLab, or Bitbucket. All source code, documentation (SPMP, SRS, SDD), design diagrams, and test scripts are stored and managed within the shared Git repository.

Control is maintained through standard Git workflows. Developers typically work on feature branches and submit pull requests for review before merging into a main development branch (e.g., `main` or `develop`). The Project Lead may oversee the merging process for the main branch. Baselining occurs implicitly with significant merges or tagged releases corresponding to INC completions. Status accounting is provided by Git's log, history, and branch/tag features.

Change requests (e.g., requirement adjustments, significant design changes) are discussed within the team during meetings. The Project Lead facilitates the decision process, considering impacts on scope and schedule. Approved changes are documented (e.g., updating SRS/SDD) and implemented, with traceability maintained through Git commits.

### 7.2 Verification and Validation Plan

This subclause contains the verification and validation (V&V) plan for the Darknet Duel project, detailing the scope, tools, techniques, and responsibilities for V&V activities. V&V is integrated throughout the development lifecycle. The Project Lead oversees V&V activities, ensuring independence between development and verification where practical (e.g., code reviews). Validation is primarily achieved through testing against requirements and team acceptance.

Key V&V activities include:

*   **Traceability Analysis:** Ensures requirements from the SRS are reflected in the SDD, implemented in the code (both frontend and backend), and covered by tests. Traceability is maintained via the module structure, documentation references, and Git commit history.
*   **Evaluation:** Assesses work products for correctness, consistency, and adherence to standards. This includes Project Lead code reviews (checking against SOLID, DRY, KISS, YAGNI, OWASP), design reviews against the SDD and diagrams, documentation reviews, and potentially static analysis provided by IDEs.
*   **Interface Analysis:** Verifies the consistency and correctness of interfaces between components, primarily focusing on the REST API (defined via Swagger) and WebSocket communication contract between the React frontend and the Spring Boot backend.
*   **Testing:** Employs various testing levels:
    *   *Component/Unit Testing:* Verifying individual Java classes/methods (JUnit/Mockito) and React components (Jest/React Testing Library).
    *   *Integration Testing:* Testing interactions between backend components (Spring Test) and potentially frontend service integrations.
    *   *System Testing:* Evaluating the integrated system against SRS requirements (may involve manual testing or broader automated E2E tests).
    *   *End-to-End (E2E) Testing:* Using Python scripts (`requests` library, potentially WebSocket clients) to test full user scenarios through the API.
    *   *Acceptance Testing:* Implicitly performed by the team upon successful completion of module tests, feature validation against requirements, and the final project demonstration.

The following table outlines the V&V plan for each major phase:

| Phase                   | V&V Input                                                                 | V&V Tasks                                                                                                                                                              | V&V Output                                                                                                                               |
| :---------------------- | :------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirements/Design** | SRS, SDD, PlantUML Diagrams                                               | Requirements/Design Traceability Analysis, Requirements/Design Evaluation, Interface Analysis (API/WebSocket Definition), High-level Test Plan Generation             | V&V Task Reports (Informal), Initial Test Strategy Outline                                                                             |
| **Implementation**      | SDD, Code (Java, React), Design Documentation                           | Code Traceability Analysis, Code Evaluation (Reviews), Interface Analysis (Implementation Checks), Documentation Evaluation (Swagger, Comments), Unit/Integration Test Execution | V&V Task Reports (Informal), Test Results (Unit/Integration), Code Review Feedback (via Git/Workspace), Generated Swagger Documentation |
| **Testing/Integration** | Integrated Codebase, Unit/Integration Test Results, Test Cases/Procedures | System Test Execution (Manual/E2E), End-to-End Test Execution (Python Scripts), Defect Reporting and Tracking, Regression Testing                                        | V&V Task Reports (Informal), Test Results (System/E2E), Bug Reports/Issue Tracker Updates                                                |
| **Delivery/Acceptance** | Final Integrated System, All Test Results, SRS/SDD, Final Documentation | Final Acceptance Testing (Team Validation/Demo), Final Documentation Review (README), Review of Test Coverage                                                            | V&V Task Reports (Informal), Final V&V Summary (Potentially part of Final Report/Presentation), Implicit Team Acceptance                  |

*[Table 7.2.1] V&V Plan by Phase*

The primary responsibility for V&V lies with the entire development team. Developers write unit/integration tests for their code. Peer code reviews contribute significantly to verification. The team collaborates on developing and maintaining the end-to-end test suite. The Project Lead oversees the overall testing strategy and ensures adequate coverage. Tools employed include JUnit, Mockito, Spring Test, Python (`requests` library), Swagger, Git, and the team's chosen IDEs.

### 7.3 Documentation Plan

The documentation plan covers the creation and maintenance of both deliverable and non-deliverable work products essential for the project.

Non-deliverable work products, primarily used during development, include this SPMP, the Software Requirements Specification (SRS), the Software Design Document (SDD), detailed design diagrams, Git commit logs, and communication history within the shared workspace environment. These are maintained and updated as needed, primarily by the Project Lead with input or generation assistance from team members.

Deliverable work products include the complete application source code, generated Swagger/OpenAPI documentation, automated test suites (unit, integration, end-to-end), a comprehensive README.md file, and the final project report/presentation required by the course.

The Project Lead coordinates the creation and maintenance of major documents (SPMP, SRS, SDD, final report), with contributions from all team members. Developers are responsible for code comments, Swagger annotations for their APIs, and potentially documentation specific to complex modules they implemented. Peer reviews extend to documentation to ensure clarity and accuracy. All documentation is version-controlled in Git.

### 7.4 Quality Assurance Plan

Quality Assurance (QA) activities are interwoven with the development process to ensure both the final product and the development process itself meet the defined standards and objectives. The plan focuses on defect prevention and early detection rather than relying solely on post-development QA cycles. Key QA elements include strict adherence to coding standards (SOLID, DRY, KISS, YAGNI) and security best practices (OWASP), enforced through Project Lead guidance and review of team members' output.

Comprehensive automated testing (unit, integration, end-to-end) forms a core part of the QA strategy, providing continuous feedback on code quality and functional correctness. Verification activities, particularly Project Lead code reviews and design adherence checks, are integral to assuring quality. Validation testing ensures the product meets user needs.

The QA process is directly linked to V&V activities, configuration management (ensuring code integrity), and reviews (Project Lead oversight). There is no separate QA team; quality is a shared responsibility, primarily driven by the Project Lead's standards and oversight and team members' adherence to instructions and best practices.

### 7.5 Reviews and Audits

Project reviews are conducted through several mechanisms:
*   **Peer Code Reviews:** Developers review each other's code (e.g., via pull requests) before merging to the main branch.
*   **Weekly Team Meetings:** Progress is reviewed, issues are discussed, and plans are adjusted.
*   **Milestone Reviews/Demos:** Functionality is demonstrated to the team and potentially faculty advisors at the end of implementation increments (INCs).
*   **Faculty Advisor Reviews:** Formal reviews of deliverables (SRS, SDD, SPMP, final demo) are conducted by the course instructor/advisor according to the academic schedule.

No external audits are planned.

### 7.6 Problem Resolution Plan

Problems (bugs, defects, requirement misunderstandings) are identified through testing (automated or manual), code reviews, or team discussions. Issues should be reported promptly within the team on the designated Microsoft Teams chat.

Analysis and prioritization are done collaboratively by the team, led by the Project Lead. High-priority issues impacting core functionality or blocking progress are addressed first. Resolution involves developers fixing the issue on a branch, testing the fix, and merging it after peer review. Verification is done by the reporter or through automated tests. The Git history serves as the primary log for tracking fixes.

### 7.7 Subcontractor Management Plan

Not applicable. This is a self-contained student capstone project with no subcontractors.

### 7.8 Process Improvement Plan

Process improvement is handled informally through team reflection and discussion, typically during weekly meetings or post-mortems after major increments or the final demo. The team can identify bottlenecks (e.g., slow code reviews, inefficient testing) or successful practices and adjust their workflow accordingly for subsequent phases or future projects. Lessons learned will be documented as part of the final project report or presentation as required by the course.

## 8. Additional Plans

No formal additional plans beyond those integrated into the preceding sections are required for this project. Security considerations, particularly adherence to OWASP best practices, are embedded within the development methodology, quality assurance, and verification activities described in sections 6 and 7. Specific plans for installation, user training, data conversion, system transition, maintenance, or support are outside the scope of this project.

## 9. Plan Annexes

All essential supporting details and specifications are contained within the main project documents, referenced throughout this SPMP. No separate annexes are attached. Key reference documents include:
*   Software Requirements Specification (SRS)
*   Software Design Document (SDD)

## 10. Index

An index is not provided for this document.
