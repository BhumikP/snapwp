declare module '@snapwp/next/withSnapWP' {
    const withSnapWP: ( nextConfig?: NextConfig ) => Promise< NextConfig >;  
    export = withSnapWP;
  }