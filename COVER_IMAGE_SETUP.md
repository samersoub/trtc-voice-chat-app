# Profile Cover Image Setup

## Adding the Default Cover Image

The abstract fluid art image you provided should be saved to:

```
public/images/default-cover.jpg
```

### Steps to Add the Image:

1. **Save the Image File**
   - Take the abstract fluid art image (purple, cyan, pink tones)
   - Save it as `default-cover.jpg`
   - Place it in the `public/images/` directory

2. **Recommended Image Specifications**
   - Format: JPG or PNG
   - Resolution: 1920x1080 or higher
   - Aspect Ratio: 16:9 or wider
   - File Size: Optimized (under 500KB recommended)

3. **Image Features**
   - Abstract fluid art style
   - Color palette: Purple, cyan, turquoise, pink
   - Smooth flowing patterns
   - Professional quality

### How It Works

- **Default Behavior**: All users will see this image as their default profile cover
- **User Customization**: Users can click the "تغيير الغلاف" (Change Cover) button to upload their own cover image
- **File Upload**: Supports standard image formats (JPG, PNG, WebP, etc.)
- **Preview**: Changes are previewed immediately in the browser

### Technical Implementation

The cover image system uses:
- React state management for dynamic updates
- FileReader API for instant preview
- Hidden file input triggered by button click
- Fallback gradient if image fails to load

### File Path Reference

```
public/
  └── images/
      └── default-cover.jpg  ← Place your image here
```

### Testing

After adding the image:
1. Navigate to `/profile/modern`
2. The cover should display the abstract fluid art
3. Click "تغيير الغلاف" to test uploading a new image
4. The preview should update immediately

---

**Note**: The placeholder file currently in `public/images/default-cover.jpg` should be replaced with the actual image from your attachment.
