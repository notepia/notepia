package util

import (
	"bytes"
	"encoding/json"
	"strings"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/text"
)

// TipTapNode represents a node in the TipTap JSON structure
type TipTapNode struct {
	Type    string                 `json:"type"`
	Content []TipTapNode           `json:"content,omitempty"`
	Marks   []TipTapMark           `json:"marks,omitempty"`
	Text    string                 `json:"text,omitempty"`
	Attrs   map[string]interface{} `json:"attrs,omitempty"`
}

// TipTapMark represents a mark (formatting) in TipTap
type TipTapMark struct {
	Type  string                 `json:"type"`
	Attrs map[string]interface{} `json:"attrs,omitempty"`
}

// MarkdownToTipTap converts markdown text to TipTap JSON format
func MarkdownToTipTap(markdown string) (string, error) {
	// Parse markdown using goldmark
	md := goldmark.New()
	reader := text.NewReader([]byte(markdown))
	doc := md.Parser().Parse(reader)

	// Convert AST to TipTap JSON
	tiptapDoc := TipTapNode{
		Type:    "doc",
		Content: []TipTapNode{},
	}

	// Process all children of the document
	for child := doc.FirstChild(); child != nil; child = child.NextSibling() {
		if node := convertNode(child, []byte(markdown)); node != nil {
			tiptapDoc.Content = append(tiptapDoc.Content, *node)
		}
	}

	// If there's no content, add an empty paragraph
	if len(tiptapDoc.Content) == 0 {
		tiptapDoc.Content = append(tiptapDoc.Content, TipTapNode{
			Type: "paragraph",
		})
	}

	// Convert to JSON
	jsonBytes, err := json.Marshal(tiptapDoc)
	if err != nil {
		return "", err
	}

	return string(jsonBytes), nil
}

// convertNode converts a goldmark AST node to a TipTap node
func convertNode(n ast.Node, source []byte) *TipTapNode {
	switch n.Kind() {
	case ast.KindParagraph:
		return convertParagraph(n, source)
	case ast.KindHeading:
		return convertHeading(n, source)
	case ast.KindBlockquote:
		return convertBlockquote(n, source)
	case ast.KindCodeBlock:
		return convertCodeBlock(n, source)
	case ast.KindFencedCodeBlock:
		return convertFencedCodeBlock(n, source)
	case ast.KindList:
		return convertList(n, source)
	case ast.KindListItem:
		return convertListItem(n, source)
	case ast.KindThematicBreak:
		return &TipTapNode{Type: "horizontalRule"}
	case ast.KindHTMLBlock:
		// Skip HTML blocks
		return nil
	default:
		// For other block-level nodes, try to process children
		return convertParagraph(n, source)
	}
}

func convertParagraph(n ast.Node, source []byte) *TipTapNode {
	node := &TipTapNode{
		Type:    "paragraph",
		Content: []TipTapNode{},
	}

	for child := n.FirstChild(); child != nil; child = child.NextSibling() {
		if inlineNode := convertInlineNode(child, source); inlineNode != nil {
			node.Content = append(node.Content, *inlineNode)
		}
	}

	return node
}

func convertHeading(n ast.Node, source []byte) *TipTapNode {
	heading := n.(*ast.Heading)
	node := &TipTapNode{
		Type: "heading",
		Attrs: map[string]interface{}{
			"level": heading.Level,
		},
		Content: []TipTapNode{},
	}

	for child := n.FirstChild(); child != nil; child = child.NextSibling() {
		if inlineNode := convertInlineNode(child, source); inlineNode != nil {
			node.Content = append(node.Content, *inlineNode)
		}
	}

	return node
}

func convertBlockquote(n ast.Node, source []byte) *TipTapNode {
	node := &TipTapNode{
		Type:    "blockquote",
		Content: []TipTapNode{},
	}

	for child := n.FirstChild(); child != nil; child = child.NextSibling() {
		if childNode := convertNode(child, source); childNode != nil {
			node.Content = append(node.Content, *childNode)
		}
	}

	return node
}

func convertCodeBlock(n ast.Node, source []byte) *TipTapNode {
	var buf bytes.Buffer
	lines := n.Lines()
	for i := 0; i < lines.Len(); i++ {
		line := lines.At(i)
		buf.Write(line.Value(source))
	}

	return &TipTapNode{
		Type: "codeBlock",
		Content: []TipTapNode{
			{
				Type: "text",
				Text: strings.TrimSuffix(buf.String(), "\n"),
			},
		},
	}
}

func convertFencedCodeBlock(n ast.Node, source []byte) *TipTapNode {
	fenced := n.(*ast.FencedCodeBlock)
	var buf bytes.Buffer
	lines := n.Lines()
	for i := 0; i < lines.Len(); i++ {
		line := lines.At(i)
		buf.Write(line.Value(source))
	}

	node := &TipTapNode{
		Type: "codeBlock",
		Content: []TipTapNode{
			{
				Type: "text",
				Text: strings.TrimSuffix(buf.String(), "\n"),
			},
		},
	}

	// Add language attribute if specified
	if fenced.Language(source) != nil {
		if node.Attrs == nil {
			node.Attrs = make(map[string]interface{})
		}
		node.Attrs["language"] = string(fenced.Language(source))
	}

	return node
}

func convertList(n ast.Node, source []byte) *TipTapNode {
	list := n.(*ast.List)
	var listType string
	if list.IsOrdered() {
		listType = "orderedList"
	} else {
		listType = "bulletList"
	}

	node := &TipTapNode{
		Type:    listType,
		Content: []TipTapNode{},
	}

	// Add order attribute for ordered lists
	if list.IsOrdered() && list.Start != 1 {
		if node.Attrs == nil {
			node.Attrs = make(map[string]interface{})
		}
		node.Attrs["start"] = list.Start
	}

	for child := n.FirstChild(); child != nil; child = child.NextSibling() {
		if childNode := convertNode(child, source); childNode != nil {
			node.Content = append(node.Content, *childNode)
		}
	}

	return node
}

func convertListItem(n ast.Node, source []byte) *TipTapNode {
	node := &TipTapNode{
		Type:    "listItem",
		Content: []TipTapNode{},
	}

	for child := n.FirstChild(); child != nil; child = child.NextSibling() {
		if childNode := convertNode(child, source); childNode != nil {
			node.Content = append(node.Content, *childNode)
		}
	}

	// If list item has no block content, wrap inline content in a paragraph
	if len(node.Content) == 0 {
		node.Content = append(node.Content, TipTapNode{
			Type: "paragraph",
		})
	}

	return node
}

func convertInlineNode(n ast.Node, source []byte) *TipTapNode {
	switch n.Kind() {
	case ast.KindText:
		return convertText(n, source, []TipTapMark{})
	case ast.KindEmphasis:
		emphasis := n.(*ast.Emphasis)
		if emphasis.Level == 1 {
			// Italic (*)
			return convertEmphasis(n, source)
		} else if emphasis.Level == 2 {
			// Bold (**)
			return convertStrong(n, source)
		}
		return convertEmphasis(n, source)
	case ast.KindCodeSpan:
		return convertCodeSpan(n, source)
	case ast.KindLink:
		return convertLink(n, source)
	case ast.KindImage:
		return convertImage(n, source)
	case ast.KindAutoLink:
		return convertAutoLink(n, source)
	default:
		// For unknown inline nodes, try to extract text
		if textNode, ok := n.(*ast.Text); ok {
			return &TipTapNode{
				Type: "text",
				Text: string(textNode.Segment.Value(source)),
			}
		}
		return nil
	}
}

func convertText(n ast.Node, source []byte, marks []TipTapMark) *TipTapNode {
	textNode := n.(*ast.Text)
	text := string(textNode.Segment.Value(source))

	// Handle soft line breaks
	if textNode.SoftLineBreak() {
		text += "\n"
	}

	// Handle hard line breaks
	if textNode.HardLineBreak() {
		return &TipTapNode{
			Type: "hardBreak",
		}
	}

	node := &TipTapNode{
		Type: "text",
		Text: text,
	}

	if len(marks) > 0 {
		node.Marks = marks
	}

	return node
}

func convertEmphasis(n ast.Node, source []byte) *TipTapNode {
	emphasis := n.(*ast.Emphasis)
	marks := []TipTapMark{{Type: "italic"}}

	// Process child nodes with italic mark
	for child := emphasis.FirstChild(); child != nil; child = child.NextSibling() {
		if child.Kind() == ast.KindText {
			return convertText(child, source, marks)
		}
	}

	return nil
}

func convertStrong(n ast.Node, source []byte) *TipTapNode {
	strong := n.(*ast.Emphasis)
	marks := []TipTapMark{{Type: "bold"}}

	// Process child nodes with bold mark
	for child := strong.FirstChild(); child != nil; child = child.NextSibling() {
		if child.Kind() == ast.KindText {
			return convertText(child, source, marks)
		}
	}

	return nil
}

func convertCodeSpan(n ast.Node, source []byte) *TipTapNode {
	codeSpan := n.(*ast.CodeSpan)
	var buf bytes.Buffer
	for i := 0; i < codeSpan.ChildCount(); i++ {
		child := codeSpan.FirstChild()
		for j := 0; j < i; j++ {
			child = child.NextSibling()
		}
		if text, ok := child.(*ast.Text); ok {
			buf.Write(text.Segment.Value(source))
		}
	}

	return &TipTapNode{
		Type: "text",
		Text: buf.String(),
		Marks: []TipTapMark{
			{Type: "code"},
		},
	}
}

func convertLink(n ast.Node, source []byte) *TipTapNode {
	link := n.(*ast.Link)
	marks := []TipTapMark{
		{
			Type: "link",
			Attrs: map[string]interface{}{
				"href":   string(link.Destination),
				"target": "_blank",
			},
		},
	}

	// Get link text
	var text string
	for child := link.FirstChild(); child != nil; child = child.NextSibling() {
		if textNode, ok := child.(*ast.Text); ok {
			text += string(textNode.Segment.Value(source))
		}
	}

	return &TipTapNode{
		Type:  "text",
		Text:  text,
		Marks: marks,
	}
}

func convertImage(n ast.Node, source []byte) *TipTapNode {
	image := n.(*ast.Image)

	// Get alt text
	var alt string
	for child := image.FirstChild(); child != nil; child = child.NextSibling() {
		if textNode, ok := child.(*ast.Text); ok {
			alt += string(textNode.Segment.Value(source))
		}
	}

	return &TipTapNode{
		Type: "image",
		Attrs: map[string]interface{}{
			"src": string(image.Destination),
			"alt": alt,
		},
	}
}

func convertAutoLink(n ast.Node, source []byte) *TipTapNode {
	autoLink := n.(*ast.AutoLink)
	url := string(autoLink.URL(source))

	return &TipTapNode{
		Type: "text",
		Text: url,
		Marks: []TipTapMark{
			{
				Type: "link",
				Attrs: map[string]interface{}{
					"href":   url,
					"target": "_blank",
				},
			},
		},
	}
}
