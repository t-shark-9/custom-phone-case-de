#!/usr/bin/env python3
import trimesh
import os

os.chdir('/Users/tjarkschool/Desktop/phone case/custom-phone-case-de/public/models')

# Convert iPhone 14 Pro
print('Converting iPhone 14 Pro...')
mesh14 = trimesh.load('iphone_14_pro.stl')
mesh14.export('iphone_14_pro.glb')
print('✓ Created iphone_14_pro.glb')

# Convert iPhone 16 Pro  
print('Converting iPhone 16 Pro...')
mesh16 = trimesh.load('iphone_16_pro.stl')
mesh16.export('iphone_16_pro.glb')
print('✓ Created iphone_16_pro.glb')

print('\nConversion complete!')
