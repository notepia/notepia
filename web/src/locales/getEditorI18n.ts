import type { TFunction } from 'i18next';

export const getEditorI18n = (t: TFunction<'editor'>) => {
    return {
        messages: {
            ui: {
                blockTunes: {
                    toggler: {
                        'Click to tune': t('ui.blockTunes.toggler.Click to tune'),
                        'or drag to move': t('ui.blockTunes.toggler.or drag to move'),
                    },
                },
                inlineToolbar: {
                    converter: {
                        'Convert to': t('ui.inlineToolbar.converter.Convert to'),
                    },
                },
                toolbar: {
                    toolbox: {
                        Add: t('ui.toolbar.toolbox.Add'),
                    },
                },
                popover: {
                    Filter: t('ui.popover.Filter'),
                    "Nothing found": t('ui.popover.Nothing found'),
                    "Convert to": t('ui.popover.Convert to')
                }
            },
            toolNames: {
                Text: t('toolNames.Text'),
                Paragraph: t('toolNames.Paragraph'),
                Heading: t('toolNames.Heading'),
                List: t('toolNames.List'),
                Checklist: t('toolNames.Checklist'),
                "Ordered List": t("toolNames.Ordered List"),
                "Unordered List": t("toolNames.Unordered List"),
                Quote: t('toolNames.Quote'),
                Warning: t('toolNames.Warning'),
                Code: t('toolNames.Code'),
                Delimiter: t('toolNames.Delimiter'),
                Table: t('toolNames.Table'),
                Link: t('toolNames.Link'),
                Image: t('toolNames.Image'),
                Raw: t('toolNames.Raw'),
                Embed: t('toolNames.Embed'),
                Marker: t('toolNames.Marker'),
                InlineCode: t('toolNames.InlineCode'),
                Attachment: t('toolNames.Attachment'),
                TextGen: t('toolNames.TextGen')
            },
            tools: {
                warning: {
                    Title: t('tools.warning.Title'),
                    Message: t('tools.warning.Message'),
                },
                link: {
                    'Add a link': t('tools.link.Add a link'),
                    Link: t('tools.link.Link'),
                    'Couldn’t fetch the link data, try a different one': t(
                        'tools.link.Couldn’t fetch the link data, try a different one'
                    ),
                },
                image: {
                    Caption: t('tools.image.Caption'),
                    'Select an Image': t('tools.image.Select an Image'),
                    'With border': t('tools.image.With border'),
                    'Stretch image': t('tools.image.Stretch image'),
                    'With background': t('tools.image.With background'),
                    'Upload failed': t('tools.image.Upload failed'),
                },
                table: {
                    'Add row': t('tools.table.Add row'),
                    'Add column': t('tools.table.Add column'),
                    'Delete row': t('tools.table.Delete row'),
                    'Delete column': t('tools.table.Delete column'),
                    'With headings': t('tools.table.With headings'),
                    'Without headings': t('tools.table.Without headings'),
                },
                list: {
                    Ordered: t('tools.list.Ordered'),
                    Unordered: t('tools.list.Unordered'),
                    Checklist: t('tools.list.Checklist'),
                },
                quote: {
                    Quote: t('tools.quote.Quote'),
                    Caption: t('tools.quote.Caption'),
                },
                embed: {
                    'Enter a link': t('tools.embed.Enter a link'),
                    'Link to content': t('tools.embed.Link to content'),
                    Service: t('tools.embed.Service'),
                    'Not supported': t('tools.embed.Not supported'),
                    'We can’t embed this link, try another': t(
                        'tools.embed.We can’t embed this link, try another'
                    ),
                },
                code: {
                    Code: t('tools.code.Code'),
                },
                raw: {
                    'Raw HTML': t('tools.raw.Raw HTML'),
                },
                marker: {
                    Marker: t('tools.marker.Marker'),
                },
                inlineCode: {
                    'Inline code': t('tools.inlineCode.Inline code'),
                },
            },
            blockTunes: {
                delete: {
                    Delete: t('blockTunes.delete.Delete'),
                    'Click to delete': t('blockTunes.delete.Click to delete'),
                },
                moveUp: {
                    'Move up': t('blockTunes.moveUp.Move up'),
                },
                moveDown: {
                    'Move down': t('blockTunes.moveDown.Move down'),
                },
                duplicate: {
                    Duplicate: t('blockTunes.duplicate.Duplicate'),
                },
            },
        },
    };
}
