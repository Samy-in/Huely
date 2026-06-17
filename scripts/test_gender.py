import sys, os
sys.path.insert(0, '/Users/samyak/Documents/ML/face-styling-system')
sys.path.insert(0, '/Users/samyak/Documents/ML/face-styling-system/backend')
import logging; logging.basicConfig(level=logging.INFO)
from ml.gender_classifier.classifier import GenderClassifier
g = GenderClassifier()
print('DNN loaded:', g._net is not None)
import numpy as np
from ml.face_detection.detector import FaceResult
face = FaceResult(detected=True, bbox=(0,0,227,227),
    face_crop=(np.random.rand(227,227,3)*255).astype('uint8'), landmarks=None)
print('Predict:', g.classify(face, 'Square'))
print('ALL OK')
