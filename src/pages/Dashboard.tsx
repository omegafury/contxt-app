import { Grid } from "@material-ui/core";
import React from "react";
import DashboardBody from "src/components/Dashboard/DashboardBody";
import DashboardHeader from "src/components/Dashboard/DashboardHeader";

const Dashboard: React.FC = () => {
  return (
    <Grid
      container
      direction="column"
      justify="flex-start"
      alignItems="stretch"
    >
      <DashboardHeader />
      <DashboardBody />
    </Grid>
  );
};

export default Dashboard;
