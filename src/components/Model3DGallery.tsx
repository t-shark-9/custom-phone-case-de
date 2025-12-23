import { Model3DViewer } from './components/Model3DViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

export function Model3DGallery() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">iPhone Case 3D Models</h1>
      
      <Tabs defaultValue="iphone14" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="iphone14">iPhone 14 Pro</TabsTrigger>
          <TabsTrigger value="iphone16">iPhone 16 Pro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="iphone14">
          <Model3DViewer
            modelPath="/models/iphone_14_pro.stl"
            title="iPhone 14 Pro Phone Case"
          />
        </TabsContent>
        
        <TabsContent value="iphone16">
          <Model3DViewer
            modelPath="/models/iphone_16_pro.stl"
            title="iPhone 16 Pro Phone Case"
          />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">📱 3D-Modelle erfolgreich konvertiert!</h2>
        <p className="text-gray-700">
          Die STEP-Dateien wurden zu STL konvertiert und können jetzt in 3D betrachtet werden.
        </p>
        <ul className="mt-3 list-disc list-inside text-gray-600">
          <li>iPhone 14 Pro Case (393 KB)</li>
          <li>iPhone 16 Pro Case (474 KB)</li>
        </ul>
      </div>
    </div>
  );
}
