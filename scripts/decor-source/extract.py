import numpy as np
from PIL import Image
from collections import deque
import os

SRC = 'D:/portofolio/personal3/public/images/decor-src/sheet.webp'
OUT_DIR = 'D:/portofolio/personal3/public/images/decor'
os.makedirs(OUT_DIR, exist_ok=True)
for f in os.listdir(OUT_DIR):
    os.remove(os.path.join(OUT_DIR, f))

im = Image.open(SRC).convert('RGBA')
arr = np.array(im)
H, W, _ = arr.shape
alpha = arr[:, :, 3]

mask = alpha > 20

def dilate(m, iterations=1):
    m = m.copy()
    for _ in range(iterations):
        padded = np.pad(m, 1, mode='constant', constant_values=False)
        m = (
            padded[1:-1,1:-1] | padded[:-2,1:-1] | padded[2:,1:-1] |
            padded[1:-1,:-2] | padded[1:-1,2:] |
            padded[:-2,:-2] | padded[:-2,2:] | padded[2:,:-2] | padded[2:,2:]
        )
    return m

dilated = dilate(mask, iterations=3)

visited = np.zeros_like(dilated, dtype=bool)
components = []

for y in range(H):
    row_any = dilated[y].any()
    if not row_any:
        continue
    for x in range(W):
        if dilated[y, x] and not visited[y, x]:
            q = deque([(y, x)])
            visited[y, x] = True
            minx, maxx, miny, maxy = x, x, y, y
            pixel_count = 0
            while q:
                cy, cx = q.popleft()
                pixel_count += 1
                if cx < minx: minx = cx
                if cx > maxx: maxx = cx
                if cy < miny: miny = cy
                if cy > maxy: maxy = cy
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
                    ny, nx = cy+dy, cx+dx
                    if 0 <= ny < H and 0 <= nx < W and dilated[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        q.append((ny, nx))
            components.append((minx, miny, maxx, maxy, pixel_count))

print(f'found {len(components)} raw components')
components = [c for c in components if c[4] > 80]
print(f'after filtering small noise: {len(components)} components')

components.sort(key=lambda c: (round(c[1]/60), c[0]))

PAD = 6
manifest = []
for i, (minx, miny, maxx, maxy, count) in enumerate(components):
    x0 = max(0, minx - PAD)
    y0 = max(0, miny - PAD)
    x1 = min(W, maxx + PAD + 1)
    y1 = min(H, maxy + PAD + 1)
    crop = im.crop((x0, y0, x1, y1))
    fname = f'piece-{i:02d}.png'
    crop.save(os.path.join(OUT_DIR, fname))
    manifest.append((fname, x0, y0, x1-x0, y1-y0, count))

for m in manifest:
    print(m)
