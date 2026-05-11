# Forms & Inputs

**Unibac:** Formularios con `react-hook-form` usan `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl` y `FormMessage` desde `@/components/ui/form` (Registry Starter). Filtros u otros bloques sin RHF: `Label` + control en `grid`/`flex` con `gap-*` (no `space-y-*`).

## Contents

- RHF: `Form` + `FormField` + `FormItem`
- InputGroup requires InputGroupInput/InputGroupTextarea
- Buttons inside inputs use InputGroup + InputGroupAddon
- Option sets (2–7 choices) use ToggleGroup
- Grouping related checkboxes/radios
- Validation with `FormMessage` / `aria-invalid`

---

## RHF: Form + FormField + FormItem

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Choosing form controls:**

- Simple text input → `Input`
- Dropdown with predefined options → `Select`
- Searchable dropdown → `Combobox`
- Native HTML select (no JS) → `native-select`
- Boolean toggle → `Switch` (for settings) or `Checkbox` (for forms)
- Single choice from few options → `RadioGroup`
- Toggle between 2–5 options → `ToggleGroup` + `ToggleGroupItem`
- OTP/verification code → `InputOTP`
- Multi-line text → `Textarea`

---

## InputGroup requires InputGroupInput/InputGroupTextarea

Never use raw `Input` or `Textarea` inside an `InputGroup`.

**Incorrect:**

```tsx
<InputGroup>
  <Input placeholder="Search..." />
</InputGroup>
```

**Correct:**

```tsx
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"

<InputGroup>
  <InputGroupInput placeholder="Search..." />
</InputGroup>
```

---

## Buttons inside inputs use InputGroup + InputGroupAddon

Never place a `Button` directly inside or adjacent to an `Input` with custom positioning.

**Incorrect:**

```tsx
<div className="relative">
  <Input placeholder="Search..." className="pr-10" />
  <Button className="absolute right-0 top-0" size="icon">
    <SearchIcon />
  </Button>
</div>
```

**Correct:**

```tsx
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"

<InputGroup>
  <InputGroupInput placeholder="Search..." />
  <InputGroupAddon>
    <Button size="icon">
      <SearchIcon data-icon="inline-start" />
    </Button>
  </InputGroupAddon>
</InputGroup>
```

---

## Option sets (2–7 choices) use ToggleGroup

Don't manually loop `Button` components with active state.

**Incorrect:**

```tsx
const [selected, setSelected] = useState("daily")

<div className="flex gap-2">
  {["daily", "weekly", "monthly"].map((option) => (
    <Button
      key={option}
      variant={selected === option ? "default" : "outline"}
      onClick={() => setSelected(option)}
    >
      {option}
    </Button>
  ))}
</div>
```

**Correct:**

```tsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<ToggleGroup spacing={2}>
  <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
  <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
  <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
</ToggleGroup>
```

Con etiqueta accesible, envolver en `FormItem` + `FormLabel` o `fieldset`/`legend` según el caso.

> **Note:** `defaultValue` and `type`/`multiple` props differ between base and radix. See [base-vs-radix.md](./base-vs-radix.md#togglegroup).

---

## Grouping related checkboxes/radios

Usa `fieldset` + `legend` semánticos, o un contenedor con `flex flex-col gap-3` y `Label` asociado a cada control (`htmlFor`).

```tsx
<fieldset className="flex flex-col gap-3 rounded-md border border-border p-4">
  <legend className="text-sm font-medium">Preferencias</legend>
  <p className="text-xs text-muted-foreground">Selecciona las que apliquen.</p>
  <div className="flex flex-row items-center gap-2">
    <Checkbox id="dark" />
    <Label htmlFor="dark" className="font-normal">
      Modo oscuro
    </Label>
  </div>
</fieldset>
```

---

## Validation with FormMessage / aria-invalid

Con RHF + Zod, `FormMessage` muestra el error del campo. En el control, refleja estado con `aria-invalid` cuando corresponda (p. ej. vía estado del `FormField`).

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" aria-invalid={!!form.formState.errors.email} {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

Aplica el mismo criterio a `Textarea`, `Select`, `Checkbox`, etc.
