
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const NotFoundState = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-destructive">Document Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            The requested document could not be found or may have been removed.
          </p>
          <Button onClick={() => window.close()} variant="outline">
            Close Window
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
