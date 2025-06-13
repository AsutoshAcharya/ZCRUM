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
}
