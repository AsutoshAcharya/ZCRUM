declare namespace Shape {
  type Feature = {
    title: string;
    description: string;
    icon: any;
  };

  type ProjectPayload = {
    name: string;
    key: string;
    description?: string;
  };

  type SprintPayload = {
    name: string;
    startDate: Date;
    endDate: Date;
  };
  type DateRange = {
    from: Date;
    to: Date;
  };
}
