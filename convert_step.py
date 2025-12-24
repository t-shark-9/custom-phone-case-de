#!/usr/bin/env python3
import sys
sys.path.append('/usr/lib/freecad-python3/lib')
import FreeCAD
import Part
import Mesh
import MeshPart
import Import
import os

os.makedirs("public/models", exist_ok=True)

# Convert iPhone 14 Pro
print("Converting iPhone 14 Pro case...")
doc = FreeCAD.newDocument("doc1")
Import.insert("Iphone 14 Pro Phone case v7.step", "doc1")
shapes = [obj.Shape for obj in doc.Objects if hasattr(obj, 'Shape')]
compound = Part.makeCompound(shapes) if len(shapes) > 1 else shapes[0]
mesh = MeshPart.meshFromShape(Shape=compound, LinearDeflection=0.1)
mesh.write("public/models/iphone_14_pro.stl")
FreeCAD.closeDocument("doc1")
print("✓ Created iphone_14_pro.stl\n")

# Convert iPhone 16 Pro
print("Converting iPhone 16 Pro case...")
doc2 = FreeCAD.newDocument("doc2")
Import.insert("iPhone 16 Pro case .step", "doc2")
shapes2 = [obj.Shape for obj in doc2.Objects if hasattr(obj, 'Shape')]
compound2 = Part.makeCompound(shapes2) if len(shapes2) > 1 else shapes2[0]
mesh2 = MeshPart.meshFromShape(Shape=compound2, LinearDeflection=0.1)
mesh2.write("public/models/iphone_16_pro.stl")
FreeCAD.closeDocument("doc2")
print("✓ Created iphone_16_pro.stl")

print("\nConversion complete!")
