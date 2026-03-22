import React, { Suspense } from "react";
import Container from "../components/ui/Container";

import ProjectsView from "./_components/ProjectsView";
import SuspenseLoading from "@/components/loadings/suspense";

export const maxDuration = 300;

const ProjectsPage = async () => {

  return (
    <Container
      title={"Portfolio Boards"}
      description={"Manage boards linked to portfolio companies"}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <ProjectsView />
      </Suspense>
    </Container>
  );
};

export default ProjectsPage;
