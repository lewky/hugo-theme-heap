{{- $params := .Scratch.Get "params" -}}
{{- if $params.linkToMarkdown -}}
# {{ .Title }}

{{ .RawContent }}
{{- end -}}