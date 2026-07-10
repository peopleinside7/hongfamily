# -*- coding: utf-8 -*-
"""
카카오프렌즈 캐릭터 에셋 크롭 스크립트
- 단색 배경의 단체 이미지에서 개별 캐릭터를 자동 검출/크롭하여 투명 배경 PNG로 저장
- 주호(춘식이)+주아(어피치) 듀오 이미지가 있으면 좌/우로 분리

사용법:
    python scripts/crop_assets.py

출력: public/kakao/*.png (앱에서 /kakao/파일명.png 로 로드)
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src", "assets", "kakao")
OUT = os.path.join(ROOT, "public", "kakao")
os.makedirs(OUT, exist_ok=True)


def bg_mask(arr, tol=42):
    """네 모서리 평균색을 배경으로 보고, 배경이 아닌 픽셀 마스크(True=전경) 반환."""
    h, w = arr.shape[:2]
    corners = np.concatenate([
        arr[0:8, 0:8].reshape(-1, 3),
        arr[0:8, w-8:w].reshape(-1, 3),
        arr[h-8:h, 0:8].reshape(-1, 3),
        arr[h-8:h, w-8:w].reshape(-1, 3),
    ])
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((arr.astype(int) - bg) ** 2).sum(axis=2))
    return dist > tol, bg


def cut_transparent(img):
    """이미지의 배경(모서리색)을 투명 처리하고 내용에 맞게 트림."""
    rgb = img.convert("RGB")
    arr = np.array(rgb)
    fg, _ = bg_mask(arr, tol=48)
    # 노이즈 제거 + 캐릭터 내부 채우기
    fg = ndimage.binary_opening(fg, iterations=1)
    fg = ndimage.binary_fill_holes(fg)
    ys, xs = np.where(fg)
    if len(xs) == 0:
        return img.convert("RGBA")
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    pad = 8
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(arr.shape[1], x1 + pad), min(arr.shape[0], y1 + pad)
    rgba = np.dstack([arr, (fg * 255).astype(np.uint8)])
    crop = rgba[y0:y1, x0:x1]
    return Image.fromarray(crop, "RGBA")


def extract_components(path, min_frac=0.004):
    """단체 이미지에서 개별 캐릭터 컴포넌트를 좌->우 순으로 크롭."""
    img = Image.open(path).convert("RGB")
    arr = np.array(img)
    fg, _ = bg_mask(arr, tol=42)
    fg = ndimage.binary_closing(fg, structure=np.ones((7, 7)), iterations=2)
    fg = ndimage.binary_fill_holes(fg)
    lbl, n = ndimage.label(fg)
    total = arr.shape[0] * arr.shape[1]
    boxes = []
    for i in range(1, n + 1):
        ys, xs = np.where(lbl == i)
        if len(xs) < total * min_frac:
            continue
        boxes.append((xs.min(), xs.max(), ys.min(), ys.max(), len(xs)))
    boxes.sort(key=lambda b: b[0])  # left -> right
    crops = []
    for (x0, x1, y0, y1, _sz) in boxes:
        pad = 6
        cx0, cy0 = max(0, x0 - pad), max(0, y0 - pad)
        cx1, cy1 = min(arr.shape[1], x1 + pad), min(arr.shape[0], y1 + pad)
        sub = arr[cy0:cy1, cx0:cx1]
        mask = fg[cy0:cy1, cx0:cx1]
        rgba = np.dstack([sub, (mask * 255).astype(np.uint8)])
        crops.append(Image.fromarray(rgba, "RGBA"))
    return crops


def save(img, name, box=512):
    """정사각 캔버스 중앙에 배치하여 저장(아바타용)."""
    img.thumbnail((box, box), Image.LANCZOS)
    canvas = Image.new("RGBA", (box, box), (0, 0, 0, 0))
    canvas.paste(img, ((box - img.width) // 2, (box - img.height) // 2), img)
    out = os.path.join(OUT, name)
    canvas.save(out)
    print(f"  saved {name}  ({img.width}x{img.height})")


def find(*names):
    for n in names:
        p = os.path.join(SRC, n)
        if os.path.exists(p):
            return p
    return None


def main():
    print("[1] 주호(춘식이)+주아(어피치) 듀오 이미지 분리")
    duo = find("juho_jua.png", "juho_jua.jpg", "juho_jua.jpeg", "juho_jua.webp",
               "choonsik_apeach.png", "choonsik_apeach.jpg")
    if duo:
        crops = extract_components(duo, min_frac=0.02)
        print(f"    검출된 캐릭터 수: {len(crops)}")
        if len(crops) >= 2:
            save(crops[0], "choonsik.png")   # 좌측 = 춘식이 = 주호
            save(crops[-1], "apeach.png")     # 우측 = 어피치 = 주아
        elif len(crops) == 1:
            # 붙어있으면 좌우 절반으로 분할
            im = Image.open(duo).convert("RGB")
            w = im.width
            save(cut_transparent(im.crop((0, 0, w // 2, im.height))), "choonsik.png")
            save(cut_transparent(im.crop((w // 2, 0, w, im.height))), "apeach.png")
    else:
        print("    (juho_jua 이미지 없음 - 춘식이는 임시 아바타 사용)")

    print("[2] 단체 이미지에서 캐릭터 세트 크롭 (스티커/보상용)")
    group = find("카카오프렌즈1.webp", "1.jpeg")
    if group:
        crops = extract_components(group, min_frac=0.004)
        print(f"    검출된 캐릭터 수: {len(crops)}")
        # 라인업 좌->우: ryan, apeach, tube, (con 작음), muzi, frodo, neo, jayg
        names = ["ryan", "apeach", "tube", "muzi", "frodo", "neo", "jayg", "con"]
        # 큰 것부터 이름 매칭이 아니라 위치순. 작은 con은 뒤로 밀릴 수 있어 크기 정렬 보정
        for idx, c in enumerate(crops):
            nm = names[idx] if idx < len(names) else f"friend{idx}"
            save(c, f"sticker_{nm}.png", box=360)
        # 어피치 아바타가 없다면 단체에서 얻은 것으로 대체
        if not os.path.exists(os.path.join(OUT, "apeach.png")) and len(crops) >= 2:
            save(crops[1], "apeach.png")
    else:
        print("    (단체 이미지 없음)")

    print("[3] 원본 배너 복사")
    for src_name, out_name in [("카카오프렌즈1.webp", "banner_lineup.webp"),
                                ("2.jpeg", "banner_beach.jpeg"),
                                ("1.jpeg", "banner_title.jpeg")]:
        p = os.path.join(SRC, src_name)
        if os.path.exists(p):
            Image.open(p).save(os.path.join(OUT, out_name))
            print(f"  copied {out_name}")

    print("완료. 출력 폴더:", OUT)


if __name__ == "__main__":
    main()
