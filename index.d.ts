declare class YourClientModule {
  constructor(options: YourClientModuleOptions);
  connect(): void;
  disconnect(): void;
  // Add other method declarations as needed
}

interface YourClientModuleOptions {
  // Define your options interface
}

export = YourClientModule;
